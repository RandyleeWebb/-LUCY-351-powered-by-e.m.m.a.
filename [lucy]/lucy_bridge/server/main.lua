local function log(msg)
    if LucyBridgeConfig.Debug then
        print(('[lucy_bridge] %s'):format(msg))
    end
end

local function postJson(path, payload, cb)
    local body = json.encode(payload or {})
    PerformHttpRequest(LucyBridgeConfig.Endpoint .. path, function(status, response)
        if cb then cb(status, response) end
    end, 'POST', body, {
        ['Content-Type'] = 'application/json',
        ['X-Lucy-Bridge-Secret'] = LucyBridgeConfig.SharedSecret
    })
end

local function getJson(path, cb)
    PerformHttpRequest(LucyBridgeConfig.Endpoint .. path, function(status, response)
        cb(status, response)
    end, 'GET', '', {
        ['X-Lucy-Bridge-Secret'] = LucyBridgeConfig.SharedSecret
    })
end

local function playersOnline()
    local count = 0
    for _, _ in ipairs(GetPlayers()) do
        count = count + 1
    end
    return count
end

local function sendResult(commandId, ok, message)
    postJson('/fivem/result', {
        commandId = commandId,
        ok = ok,
        message = message,
        resource = GetCurrentResourceName(),
        at = os.time()
    })
end

local function executeCommand(cmd)
    if not cmd or not cmd.type then return end

    if cmd.type == 'lucy:chat:broadcast' then
        local message = tostring(cmd.message or 'Lucy bridge online.')
        TriggerClientEvent('chat:addMessage', -1, {
            color = { 120, 180, 255 },
            args = { 'Lucy', message }
        })
        sendResult(cmd.id, true, 'broadcast sent')
        return
    end

    if cmd.type == 'lucy:mission:create_basic' then
        TriggerClientEvent('lucy_bridge:client:mission', -1, cmd.payload or {})
        TriggerEvent('lucy_framework:server:externalMission', cmd.payload or {})
        sendResult(cmd.id, true, 'mission dispatched')
        return
    end

    if cmd.type == 'lucy:director:scenario' then
        TriggerEvent('lucy_framework:server:injectScenario', cmd.payload or {})
        sendResult(cmd.id, true, 'scenario injected')
        return
    end

    sendResult(cmd.id, false, 'unknown command type: ' .. tostring(cmd.type))
end

CreateThread(function()
    Wait(1500)
    log('online; sending heartbeats to ' .. LucyBridgeConfig.Endpoint)
    while true do
        local payload = {
            server = GetConvar('sv_hostname', 'FiveM Server'),
            resource = GetCurrentResourceName(),
            playersOnline = playersOnline(),
            maxClients = GetConvarInt('sv_maxclients', 0),
            gameTimer = GetGameTimer(),
            lucyFramework = GetResourceState('lucy_framework')
        }
        postJson('/fivem/heartbeat', payload)
        Wait(LucyBridgeConfig.HeartbeatIntervalMs)
    end
end)

CreateThread(function()
    Wait(2500)
    while true do
        getJson('/fivem/next-command', function(status, response)
            if status == 200 and response and response ~= '' then
                local ok, decoded = pcall(json.decode, response)
                if ok and decoded and decoded.command then
                    executeCommand(decoded.command)
                end
            end
        end)
        Wait(LucyBridgeConfig.CommandPollIntervalMs)
    end
end)

RegisterCommand('lucybridge_test', function(source)
    if source ~= 0 then return end
    TriggerClientEvent('chat:addMessage', -1, { args = { 'Lucy', 'Bridge test from FXServer console.' } })
end, true)
