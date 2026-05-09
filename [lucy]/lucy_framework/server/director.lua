local function randomLocation()
    local locations = LucyConfig.MissionLocations
    return locations[math.random(1, #locations)]
end

local function countPlayers()
    local count = 0
    for _, _ in ipairs(GetPlayers()) do count = count + 1 end
    return count
end

function LucyCreateMission(src, role, seed)
    local loc = randomLocation()
    role = tostring(role or LucyConfig.DefaultRole):lower()
    local lowPop = countPlayers() <= LucyConfig.LowPopulationThreshold
    local templates = {
        police = {
            title = lowPop and 'AI Suspect Patrol' or 'Backup Patrol Support',
            objective = 'Investigate suspicious activity near ' .. loc.label .. '.'
        },
        ems = {
            title = 'Civilian Medical Response',
            objective = 'Respond to a medical welfare check near ' .. loc.label .. '.'
        },
        trucker = {
            title = 'Emergency Supply Run',
            objective = 'Deliver critical supplies to ' .. loc.label .. '.'
        },
        gang = {
            title = 'Turf Pressure Scout',
            objective = 'Scout activity near ' .. loc.label .. ' and report back.'
        },
        civilian = {
            title = 'City Support Task',
            objective = 'Help Lucy stabilize activity near ' .. loc.label .. '.'
        }
    }
    local t = templates[role] or templates.civilian
    LucyState.counters.missionsCreated = LucyState.counters.missionsCreated + 1
    local mission = {
        id = ('lucy_mission_%s_%s'):format(os.time(), LucyState.counters.missionsCreated),
        source = src,
        role = role,
        title = t.title,
        objective = t.objective,
        coords = loc.coords,
        reward = LucyConfig.MissionReward,
        scenario = LucyState.scenario,
        seed = seed or math.random(100000, 999999),
        createdAt = os.time()
    }
    LucyState.missions[mission.id] = mission
    return mission
end

function LucyCreateExternalMission(payload)
    payload = payload or {}
    LucyState.counters.missionsCreated = LucyState.counters.missionsCreated + 1
    local coords = payload.coords or LucyConfig.MissionLocations[1].coords
    local mission = {
        id = ('lucy_external_%s_%s'):format(os.time(), LucyState.counters.missionsCreated),
        source = 0,
        role = payload.role or 'civilian',
        title = payload.title or 'Lucy External Mission',
        objective = payload.objective or 'Complete the Lucy objective.',
        coords = coords,
        reward = payload.reward or LucyConfig.MissionReward,
        scenario = LucyState.scenario,
        createdAt = os.time()
    }
    LucyState.missions[mission.id] = mission
    return mission
end
