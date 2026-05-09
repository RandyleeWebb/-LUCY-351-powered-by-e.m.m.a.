
local stuntPed = nil
local rampSpawned = false

CreateThread(function()
    local model = GetHashKey("s_m_y_xmech_02")
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    stuntPed = CreatePed(4, model, Config.StuntStart.x, Config.StuntStart.y, Config.StuntStart.z - 1.0, 90.0, false, true)
    SetEntityInvincible(stuntPed, true)
    SetBlockingOfNonTemporaryEvents(stuntPed, true)
    FreezeEntityPosition(stuntPed, true)

    exports['qb-target']:AddTargetEntity(stuntPed, {
        options = {
            {
                label = "Start Stunt Challenge",
                icon = "fas fa-motorcycle",
                action = function()
                    StartStuntChallenge()
                end
            }
        },
        distance = 2.5
    })
end)

function StartStuntChallenge()
    local model = GetHashKey(Config.BikeModel)
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local coords = GetEntityCoords(PlayerPedId())
    local bike = CreateVehicle(model, coords.x, coords.y, coords.z, GetEntityHeading(PlayerPedId()), true, false)
    TaskWarpPedIntoVehicle(PlayerPedId(), bike, -1)

    SpawnStuntRamp()
    CreateCheckpoint()
end

function SpawnStuntRamp()
    if rampSpawned then return end
    local objHash = GetHashKey("xs_prop_arena_jump_01a")
    RequestModel(objHash)
    while not HasModelLoaded(objHash) do Wait(0) end

    local obj = CreateObject(objHash, Config.RampCoords.x, Config.RampCoords.y, Config.RampCoords.z, false, false, false)
    SetEntityHeading(obj, 90.0)
    FreezeEntityPosition(obj, true)
    rampSpawned = true
end

function CreateCheckpoint()
    local checkpoint = CreateCheckpoint(47, Config.Checkpoint.x, Config.Checkpoint.y, Config.Checkpoint.z, 0.0, 0.0, 0.0, 5.0, 255, 0, 0, 100, 0)
    local reached = false

    CreateThread(function()
        while not reached do
            Wait(500)
            local coords = GetEntityCoords(PlayerPedId())
            if #(coords - Config.Checkpoint) < 6.0 then
                reached = true
                DeleteCheckpoint(checkpoint)
                TriggerServerEvent("npc_stunt_challenge:rewardPlayer")
                TriggerEvent("chat:addMessage", {
                    args = { "Challenge", "Stunt complete! You earned $1500." }
                })
            end
        end
    end)
end
