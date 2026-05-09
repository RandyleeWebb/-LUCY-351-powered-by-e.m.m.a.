
CreateThread(function()
    while true do
        -- Realistic lighting and environment behavior
        SetArtificialLightsState(false)
        SetBlackout(false)
        SetTimecycleModifier("VIBRANCE") -- Suggested: VIBRANCE, tunnel, NG_filmic01
        Wait(60000) -- Update once per minute
    end
end)

-- Realistic dynamic weather transitions
local weatherTypes = {"EXTRASUNNY", "CLEAR", "CLOUDS", "FOGGY", "OVERCAST", "THUNDER", "RAIN"}
local current = 1

CreateThread(function()
    while true do
        Wait(1800000) -- Every 30 min (real-time ~15 min)
        current = current % #weatherTypes + 1
        local nextWeather = weatherTypes[current]
        SetWeatherTypeOverTime(nextWeather, 60.0)
        Wait(60000)
        ClearOverrideWeather()
        SetWeatherTypePersist(nextWeather)
        SetWeatherTypeNow(nextWeather)
    end
end)

-- Optional: auto-hide radar unless in vehicle
CreateThread(function()
    while true do
        Wait(1000)
        local ped = PlayerPedId()
        if IsPedInAnyVehicle(ped, false) then
            DisplayRadar(true)
        else
            DisplayRadar(false)
        end
    end
end)
