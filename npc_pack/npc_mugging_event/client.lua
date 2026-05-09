
local lastCheck = 0

CreateThread(function()
    while true do
        Wait(60000) -- check every minute
        if math.random() < Config.MuggingChance then
            TriggerEvent("npc_mugging_event:triggerMugging")
        end
    end
end)

RegisterNetEvent("npc_mugging_event:triggerMugging", function()
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local model = GetHashKey(Config.MuggerModels[math.random(#Config.MuggerModels)])
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local mugger = CreatePed(4, model, coords.x + 10.0, coords.y + 5.0, coords.z, 0.0, true, false)
    GiveWeaponToPed(mugger, `WEAPON_PISTOL`, 30, true, true)
    TaskGoToEntity(mugger, playerPed, -1, 4.0, 2.0, 1073741824, 0)
    Wait(3000)
    TaskAimGunAtEntity(mugger, playerPed, 5000)
    TaskPlayAnim(mugger, "random@atmrobberygen", "b_atm_mugging", 8.0, -8, -1, 1, 0, false, false, false)

    TriggerEvent("chat:addMessage", {
        args = { "Alert", "^1You’re being mugged! Try to run, fight, or give up your wallet!" }
    })

    CreateThread(function()
        Wait(15000)
        ClearPedTasks(mugger)
        TaskWanderStandard(mugger, 10.0, 10)
    end)
end)
