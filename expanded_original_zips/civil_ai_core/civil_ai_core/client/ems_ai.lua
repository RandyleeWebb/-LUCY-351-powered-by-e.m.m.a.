RegisterNetEvent('civil_ai_core:spawnEMS', function(coords)
    local model = GetHashKey("s_m_m_paramedic_01")
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local ped = CreatePed(30, model, coords.x, coords.y, coords.z, 0.0, true, true)
    TaskStartScenarioInPlace(ped, "WORLD_HUMAN_CLIPBOARD", 0, true)

    SetEntityInvincible(ped, true)
    SetPedCanBeTargetted(ped, false)

    Wait(Config.EMSAI.HealTime)
    ClearPedTasks(ped)
    TaskGoToEntity(ped, PlayerPedId(), -1, 1.0, 2.0, 0, 0)
    QBCore.Functions.Notify("EMS has arrived!", "success")
end)
