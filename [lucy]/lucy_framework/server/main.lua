math.randomseed(os.time())

AddEventHandler('playerDropped', function()
    local src = source
    if LucyState.players[tostring(src)] then
        LucyState.players[tostring(src)].online = false
    end
end)

RegisterNetEvent('lucy_framework:server:setRole', function(role)
    local src = source
    local player = LucySetRole(src, role)
    TriggerClientEvent('chat:addMessage', src, {
        color = { 120, 180, 255 },
        args = { 'Lucy', 'Role set to ' .. player.role }
    })
end)

RegisterNetEvent('lucy_framework:server:requestMission', function()
    local src = source
    local player = LucyGetPlayer(src)
    local mission = LucyCreateMission(src, player.role)
    TriggerClientEvent('lucy_framework:client:missionAssigned', src, mission)
    LucyLog(('mission %s assigned to %s'):format(mission.id, src))
end)

RegisterNetEvent('lucy_framework:server:completeMission', function(missionId)
    local src = source
    local mission = LucyState.missions[missionId]
    if mission then
        LucyState.missions[missionId] = nil
        LucyState.counters.missionsCompleted = LucyState.counters.missionsCompleted + 1
        local player = LucyGetPlayer(src)
        player.trustScore = math.min(1.0, player.trustScore + 0.02)
        player.rewardScore = math.min(1.0, player.rewardScore + 0.03)
        TriggerClientEvent('chat:addMessage', src, {
            color = { 120, 255, 180 },
            args = { 'Lucy', ('Mission complete. Trust %.2f Reward %.2f'):format(player.trustScore, player.rewardScore) }
        })
    end
end)

RegisterCommand(LucyConfig.RoleCommand, function(source, args)
    if source == 0 then
        print('Use this command in-game.')
        return
    end
    local role = args[1] or LucyConfig.DefaultRole
    local player = LucySetRole(source, role)
    TriggerClientEvent('chat:addMessage', source, { args = { 'Lucy', 'Role set to ' .. player.role } })
end, false)

RegisterCommand(LucyConfig.MissionCommand, function(source)
    if source == 0 then
        print('Use this command in-game.')
        return
    end
    local player = LucyGetPlayer(source)
    local mission = LucyCreateMission(source, player.role)
    TriggerClientEvent('lucy_framework:client:missionAssigned', source, mission)
end, false)

exports('SetPlayerRole', function(src, role)
    return LucySetRole(src, role)
end)

exports('CreateMission', function(src, role)
    return LucyCreateMission(src, role)
end)
