"use client";
import { API_BASE_URL } from "../config";

/**
 * PaloCheck Central Tracking Utility
 * Captura eventos de marketing e navegação industrial.
 */
export async function trackEvent(cta_id: string, page: string = "home") {
    const event_data = {
        event_name: "cta_click",
        cta_id: cta_id,
        page: page,
        referrer: document.referrer || null,
        utm_json: getUTMParams()
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event_data),
        });
        if (!res.ok) console.warn("[TRACKING] Falha ao registrar evento silenciosamente.");
    } catch (err) {
        console.error("[TRACKING ERROR]:", err);
    }
}

function getUTMParams() {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => {
        const val = params.get(k);
        if (val) utms[k] = val;
    });

    return Object.keys(utms).length > 0 ? utms : null;
}
