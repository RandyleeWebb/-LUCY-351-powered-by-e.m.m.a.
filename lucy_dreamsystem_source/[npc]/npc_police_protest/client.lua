
local spawnedProtesters = {}

CreateThread(function()
    while not NetworkIsSessionStarted() do Wait(1000) end
    StartProtest()
end)

function StartProtest()
    for i = 1, Config.NumProtesters do
        local model = GetHashKey(Config.Models[math.random(#Config.Models)])
        RequestModel(model)
        while not HasModelLoaded(model) do Wait(0) end

        local offsetX = math.random(-5, 5)
        local offsetY = math.random(-5, 5)
        local pos = vector3(Config.ProtestLocation.x + offsetX, Config.ProtestLocation.y + offsetY, Config.ProtestLocation.z)

        local ped = CreatePed(4, model, pos.x, pos.y, pos.z, 0.0, false, true)
        SetBlockingOfNonTemporaryEvents(ped, true)
        SetEntityInvincible(ped, true)
        TaskStartScenarioInPlace(ped, "WORLD_HUMAN_PROTEST", 0, true)

        table.insert(spawnedProtesters, ped)

        local msg = Config.Messages[math.random(#Config.Messages)]
        TriggerEvent("chat:addMessage", {
            args = { "Protester", msg }
        })
    end
end
