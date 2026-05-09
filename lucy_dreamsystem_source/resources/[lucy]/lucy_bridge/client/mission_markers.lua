RegisterNetEvent("lucy:mission:create_basic", function(mission)
    local message = 'Lucy mission received.'
    if mission and mission.title then
        message = "[LucyAI] " .. mission.title
    end
    TriggerEvent("chat:addMessage", {
        args = {message}
    })
    -- TODO: Implement marker/map objective logic (stub for v1)
end)
