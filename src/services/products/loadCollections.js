import {useEffect, useState} from "react";
import {CustomAxios} from "../auth/rest";
import openNotificationWithIcon from "../../components/alerts/notifications";

export default function useLoadCollections() {
    const [collections, setCollections] = useState({
        providers: [],
        presentations: [],
        laboratories: []
    });
    const loadCollection = async () => {
        try {
            const allCollections = await Promise.allSettled(
                [CustomAxios("/inventory/providers", {}, "GET"),
                CustomAxios("/inventory/presentations", {}, "GET"),
                CustomAxios("/inventory/labs", {}, "GET"),]
            );
            allCollections.forEach(coll => {
                if (coll?.error || coll?.data?.error) {
                    openNotificationWithIcon(
                        "error",
                        "No se pudo cargar una colleccion.",
                        coll?.error || coll?.data?.error
                    );
                }
            });
            setCollections({
                providers: allCollections[0]?.value?.data?.data || [],
                laboratories: allCollections[2]?.value?.data?.data || [],
                presentations: allCollections[1]?.value?.data?.data || []
            })
        } catch (error) {
            openNotificationWithIcon(
                "error",
                "Error al cargar las collecciones",
                error.message
            );
        }
    }
    useEffect(() => {
       loadCollection().then(_ => console.log('Collection loaded.'))
    }, []);

    return {collections, loadCollection};
}