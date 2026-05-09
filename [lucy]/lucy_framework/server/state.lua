LucyState = LucyState or {
    players = {},
    missions = {},
    scenario = { name = 'calm_city', intensity = 1 },
    counters = { missionsCreated = 0, missionsCompleted = 0 }
}

function LucyLog(message)
    if LucyConfig.Debug then
        print(('[lucy_framework] %s'):format(message))
    end
end

function LucyGetPlayer(src)
    local key = tostring(src)
    if not LucyState.players[key] then
        LucyState.players[key] = {
            source = src,
            role = LucyConfig.DefaultRole,
            trustScore = 0.50,
            rewardScore = 0.50,
            lastSeen = os.time()
        }
    end
    LucyState.players[key].lastSeen = os.time()
    return LucyState.players[key]
end

function LucySetRole(src, role)
    role = tostring(role or LucyConfig.DefaultRole):lower()
    local allowed = { police = true, ems = true, trucker = true, gang = true, civilian = true }
    if not allowed[role] then role = LucyConfig.DefaultRole end
    local player = LucyGetPlayer(src)
    player.role = role
    return player
end
