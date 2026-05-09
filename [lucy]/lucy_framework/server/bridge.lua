RegisterNetEvent('lucy_framework:server:externalMission', function(payload)
    if not LucyConfig.AllowExternalBridgeMissions then return end
    local mission = LucyCreateExternalMission(payload or {})
    TriggerClientEvent('lucy_framework:client:missionAssigned', -1, mission)
    LucyLog('external mission dispatched: ' .. mission.title)
end)

RegisterNetEvent('lucy_framework:server:injectScenario', function(payload)
    payload = payload or {}
    LucyState.scenario = {
        name = tostring(payload.scenario or 'controlled_scenario'),
        intensity = tonumber(payload.intensity or 2) or 2,
        note = tostring(payload.note or 'No note'),
        at = os.time()
    }
    TriggerClientEvent('chat:addMessage', -1, {
        color = { 120, 180, 255 },
        args = { 'Lucy', 'Scenario updated: ' .. LucyState.scenario.name .. ' intensity ' .. LucyState.scenario.intensity }
    })
    LucyLog('scenario injected: ' .. LucyState.scenario.name)
end)
