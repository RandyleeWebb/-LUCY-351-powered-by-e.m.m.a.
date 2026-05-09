
RegisterNetEvent("npc_doppelgangers:trigger")
AddEventHandler("npc_doppelgangers:trigger", function()
    TriggerClientEvent("npc_doppelgangers:spawn", source)
end)
