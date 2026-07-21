# BookAtlas Analytics Pipeline

> **A robust, asynchronous event-driven analytics microservice built for the BookAtlas platform.**

This service is responsible for capturing asynchronous events (such as search executions) from the main backend via **RabbitMQ** and permanently storing them in a **Databricks Serverless SQL Warehouse** for downstream data analysis and machine learning.

---

##  Architecture Overview

To ensure high performance and zero-blocking on the main backend, this microservice utilizes an **Event-Driven Architecture (EDA)**. 

It uses the **Databricks REST API (`requests`)** 

### The Data Flow
1. **Frontend** triggers a search request.
2. **Main Backend** returns results to the user instantly, and publishes a `SearchExecuted` event to RabbitMQ in the background.
3. **Analytics Consumer (This Service)** listens to the `analytics_queue`, consumes the event, and pushes it to Databricks via a secure REST API HTTP POST request.

---

##  1. Prerequisites

Before running this service locally, ensure your environment has the following installed and operational:

* **Python 3.8+**
* **RabbitMQ Server:** Must be running locally on port `5672`. 
  * *Docker quick-start:* `docker run -d -p 5672:5672 rabbitmq`
* **Databricks Workspace:** A premium Databricks account with **Serverless SQL Warehouses** enabled.

---

##  2. Database Provisioning

Before starting the consumer, the destination table must exist in your Databricks catalog. 

1. Open your Databricks **SQL Editor**.
2. Ensure you are targeting the `bookatlas` catalog and `storage` schema.
3. Execute the following DDL command to create the event table:

```sql
CREATE TABLE IF NOT EXISTS bookatlas.storage.analytics_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    event_type STRING,
    event_timestamp TIMESTAMP,
    payload STRING
);
```
> **Note:** We use `GENERATED ALWAYS AS IDENTITY` instead of `uuid()` to ensure the default column values are deterministic, satisfying Delta Lake's strict schema requirements.

---

## 3. Environment Configuration

Create a `.env` file in the root of your `backend` directory. You will need a Personal Access Token (PAT) that specifically has the **Databricks SQL** scope enabled.

```env
# The domain of your Databricks workspace (IMPORTANT: Do not include https://)
DATABRICKS_HOST=dbc-76c8387e-5c84.cloud.databricks.com

# Found in Databricks -> SQL Warehouses -> Connection Details
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your_warehouse_id

# Must start with 'dapi' and MUST have 'sql' scope permissions enabled
DATABRICKS_TOKEN=dapi_your_secure_token_here
```

---

## 4. Installation & Dependencies

Your `requirements.txt` should contain the following core packages. *(Note: `databricks-sql-connector` and `pyarrow` have been intentionally omitted to prevent Apple Silicon socket deadlocks).*

```text
pika==1.3.2             # RabbitMQ messaging protocol
requests==2.31.0        # Standard HTTP library for the Databricks REST API
python-dotenv==1.0.0    # Environment variable management
```

Install them by running:
```bash
pip install -r requirements.txt
```

---

## Running the Pipeline

### Step 1: Start RabbitMQ
Ensure your local RabbitMQ server is running and actively accepting connections.

### Step 2: Wake Up the SQL Warehouse
Serverless Databricks warehouses go into a "Stopped" state after 10 minutes of inactivity to save costs. 
* To avoid a 2-3 minute startup delay on your first event, go to the **Databricks UI -> SQL Warehouses** and manually click **Start**.
* Wait for the status indicator to turn **Green (Running)**.

### Step 3: Start the Consumer
In your terminal, activate your virtual environment and start the worker:
```bash
python -m analytics_service.consumer
```
*Expected Output:*
> `Analytics HTTP consumer is running and waiting for events...`

### Step 4: Trigger an Event
Run your main FastAPI backend (e.g., `uvicorn main:app --reload`) and make a request to your search endpoint (`/api/v1/books/?q=...`). The consumer terminal will instantly log the event consumption and the successful REST API insertion into Databricks!

---

## 6. Frontend Integration Guidelines

To maintain a responsive UI, the frontend should never wait for the analytics pipeline to finish. Below is a thoroughly commented example of how the frontend function should be structured.

```javascript
/**
 * Executes a book search by sending a query to the main FastAPI backend.
 * 
 * ARCHITECTURE FLOW:
 * 1. User submits a search query via the UI.
 * 2. This function hits the backend GET `/api/v1/books/?q=...` endpoint.
 * 3. The backend immediately returns the search results to the user for a fast UI experience.
 * 4. In the background, the backend publishes a "SearchExecuted" event to a RabbitMQ exchange.
 * 5. Our Python analytics consumer picks up the event from the queue.
 * 6. The consumer pushes the data to Databricks via a REST API HTTP POST request.
 * 
 * @param {string} searchQuery - The text input provided by the user.
 * @returns {Promise<Array>} - An array of book objects matching the query.
 */
async function executeBookSearch(searchQuery) {
    try {
        // We only await the actual search results. The analytics tracking 
        // happens completely asynchronously on the backend via RabbitMQ.
        const response = await fetch(`http://localhost:8000/api/v1/books/?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
            throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error("Error executing book search:", error);
        return [];
    }
}
```
---