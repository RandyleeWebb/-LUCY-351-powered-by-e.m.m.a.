
RegisterNetEvent("npc_ems_coverup:coverupScene")
AddEventHandler("npc_ems_coverup:coverupScene", function(coords, unitType)
    local msg = unitType == "EMS" and "EMS took the body... but said it was an accident." or
                                   "Fire crew torched the evidence and left."
    TriggerEvent("chat:addMessage", { args = {"Scene", msg} })
    -- Add animations, vehicle arrivals, or flame effects here later
end)

RegisterNetEvent("npc_ems_coverup:legitScene")
AddEventHandler("npc_ems_coverup:legitScene", function(coords)
    TriggerEvent("chat:addMessage", {
        args = {"Scene", "EMS and Fire arrived, took reports, and left properly."}
    })
end)
