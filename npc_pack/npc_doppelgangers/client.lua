
local doppelganger = nil
local stalking = false

RegisterNetEvent("npc_doppelgangers:spawn")
AddEventHandler("npc_doppelgangers:spawn", function()
    if stalking then return end
    stalking = true

    local playerPed = PlayerPedId()
    local playerModel = GetEntityModel(playerPed)

    RequestModel(playerModel)
    while not HasModelLoaded(playerModel) do Wait(0) end

    local coords = GetEntityCoords(playerPed)
    doppelganger = CreatePed(4, playerModel, coords.x + 50, coords.y + 50, coords.z, 0.0, true, true)
    SetEntityInvincible(doppelganger, true)
    SetPedCanRagdoll(doppelganger, false)
    TaskGoToEntity(doppelganger, playerPed, -1, 10.0, 1.0, 1073741824, 0)

    TriggerEvent("chat:addMessage", {
        args = { "System", "^1You feel like you're being watched..." }
    })

    Citizen.CreateThread(function()
        while stalking do
            Wait(5000)
            local playerCoords = GetEntityCoords(PlayerPedId())
            TaskGoToEntity(doppelganger, PlayerPedId(), -1, 10.0, 1.0, 1073741824, 0)

            if #(playerCoords - GetEntityCoords(doppelganger)) < 5.0 then
                TriggerEvent("chat:addMessage", {
                    args = { "System", "^1Something familiar is watching you..." }
                })
            end
        end
    end)
end)

-- Optional: Add a way to stop the doppelganger
RegisterCommand("endstalk", function()
    if doppelganger and DoesEntityExist(doppelganger) then
        DeleteEntity(doppelganger)
        stalking = false
        TriggerEvent("chat:addMessage", {
            args = { "System", "^2You feel the presence vanish..." }
        })
    end
end)
