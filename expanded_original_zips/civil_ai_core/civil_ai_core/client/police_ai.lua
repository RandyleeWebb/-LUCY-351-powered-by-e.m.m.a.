local activeUnits = {}

RegisterNetEvent('civil_ai_core:spawnPolice', function(coords, tier)
    local info = Config.PoliceAI.HeatEscalation[tier] or Config.PoliceAI.HeatEscalation[1]
    local model = GetHashKey(info.models[math.random(#info.models)])
    local weapon = info.weapons[math.random(#info.weapons)]

    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local ped = CreatePed(30, model, coords.x, coords.y, coords.z, 0.0, true, true)
    GiveWeaponToPed(ped, GetHashKey(weapon), 250, false, true)
    SetPedAsCop(ped, true)
    SetPedAccuracy(ped, 70)
    SetPedCombatAttributes(ped, 46, true)
    table.insert(activeUnits, ped)

    local player = PlayerPedId()
    TaskCombatPed(ped, player, 0, 16)
end)

CreateThread(function()
    while true do
        Wait(60000)
        for i, ped in ipairs(activeUnits) do
            if DoesEntityExist(ped) and not IsPedDeadOrDying(ped, true) then
                local dist = #(GetEntityCoords(ped) - GetEntityCoords(PlayerPedId()))
                if dist > Config.PoliceAI.SpawnDistance then
                    DeleteEntity(ped)
                    table.remove(activeUnits, i)
                end
            end
        end
    end
end)
