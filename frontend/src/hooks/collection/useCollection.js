import { useContext } from "react";
import { CollectionContext } from "../../context/collection/CollectionContext";


export function useCollection() {
    return useContext(CollectionContext);
}
