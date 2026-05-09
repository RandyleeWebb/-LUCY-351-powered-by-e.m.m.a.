local lastReport = 0

CreateThread(function()
    while true do
        Wait(5000)
        if not Config.CivilianDispatcher.Enabled then goto continue end

        local player = PlayerPedId()
        local pCoords = GetEntityCoords(player)
        local handle, ped = FindFirstPed()
        local success

        repeat
            if DoesEntityExist(ped) and not IsPedAPlayer(ped) and not IsPedDeadOrDying(ped, true) then
                local dist = #(GetEntityCoords(ped) - pCoords)
                if dist < Config.CivilianDispatcher.DetectionRadius and math.random() < Config.CivilianDispatcher.ReportChance then
                    if (GetGameTimer() - lastReport) > Config.CivilianDispatcher.Cooldown then
                        lastReport = GetGameTimer()
                        TriggerServerEvent('civil_ai_core:reportIncident', GetEntityCoords(ped))
                    end
                end
            end
            success, ped = FindNextPed(handle)
        until not success
        EndFindPed(handle)
        ::continue::
    end
end)
