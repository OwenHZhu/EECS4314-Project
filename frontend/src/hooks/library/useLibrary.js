import { useContext } from "react";
import { LibraryContext } from "../../context/library/LibraryContext";

export function useLibrary() {
    return useContext(LibraryContext);
}