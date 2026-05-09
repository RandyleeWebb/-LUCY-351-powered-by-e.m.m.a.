
local drone = nil
local cam = nil

RegisterCommand("newsdrone", function()
    local model = `ch_prop_cctv_cam_01a`
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local pos = Config.DroneSpawn + vector3(0.0, 0.0, Config.CamHeight)
    drone = CreateObject(model, pos.x, pos.y, pos.z, true, true, false)
    SetEntityVisible(drone, true)
    FreezeEntityPosition(drone, true)

    CreateDroneCamera(drone)
end)

function CreateDroneCamera(entity)
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    AttachCamToEntity(cam, entity, 0.0, 0.0, 1.0, true)
    SetCamActive(cam, true)
    RenderScriptCams(true, true, 1000, true, false)

    Citizen.CreateThread(function()
        while cam do
            Wait(0)
            local rot = GetGameplayCamRot(2)
            SetCamRot(cam, rot.x, 0.0, rot.z, 2)
            DrawText(0.45, 0.05, "📡 Live News Feed", 0.5)
        end
    end)
end

function DrawText(x, y, text, scale)
    SetTextFont(0)
    SetTextProportional(1)
    SetTextScale(scale, scale)
    SetTextColour(255, 255, 255, 215)
    SetTextCentre(true)
    SetTextEntry("STRING")
    AddTextComponentString(text)
    DrawText(x, y)
end
