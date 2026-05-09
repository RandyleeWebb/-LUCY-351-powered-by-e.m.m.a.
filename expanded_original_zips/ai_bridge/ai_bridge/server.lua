local chaosLevel = 0.0
local decayTimer = nil

-- DB Check
local function DBAvailable()
    return GetResourceState('oxmysql') == 'started' or (Core and Core.DB)
end

local function LogEvent(event, data)
    if not Config.UseDatabase or not DBAvailable() then return end
    pcall(function()
        MySQL.insert('INSERT INTO ai_events (event_type, data, timestamp) VALUES (?, ?, NOW())', {
            event, json.encode(data or {})
        })
    end)
end

-- Main Event
RegisterNetEvent('civil:ai_event', function(eventType, data)
    local weight = Config.EventWeights[eventType] or 1.0
    chaosLevel = math.min(Config.MaxChaos, chaosLevel + weight)
    
    TriggerClientEvent('civil:world:updateChaos', -1, chaosLevel)
    LogEvent(eventType, data)

    if Config.Debug then
        print(('[AI Bridge] %s (+%.1f) → Chaos: %.1f'):format(eventType, weight, chaosLevel))
    end

    -- Reset decay
    if decayTimer then Citizen.ClearTimeout(decayTimer) end
    decayTimer = Citizen.SetTimeout(Config.Cooldown * 1000, function()
        chaosLevel = math.max(0.0, chaosLevel - 1.0)
        TriggerClientEvent('civil:world:updateChaos', -1, chaosLevel)
        if chaosLevel > 0 then
            decayTimer = Citizen.SetTimeout(Config.Cooldown * 1000, arguments.callee)
        end
    end)
end)

-- Exports
exports('GetChaosLevel', function() return chaosLevel end)
exports('TriggerAIEvent', function(eventType, data)
    TriggerEvent('civil:ai_event', eventType, data)
end)