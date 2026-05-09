local chaosLevel = 0.0

RegisterNetEvent('civil:world:updateChaos', function(level)
    chaosLevel = level
    if Config.Debug then
        print(('[AI Bridge] Chaos: %.1f'):format(chaosLevel))
    end
end)

exports('GetLocalChaos', function() return chaosLevel end)