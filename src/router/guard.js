import { redirect } from "react-router-dom";
import { store } from "@/store/store";

export const requireAuth = () => {
    const state = store.getState();
    const user = state.user?.user;

    if (!user) {
        const currentPath = window.location.pathname + window.location.search;
        throw redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
    return null;
};

export const requireGuest = () => {
    const state = store.getState();
    const user = state.user?.user;

    if (user) {
        throw redirect("/");
    }
    return null;
};