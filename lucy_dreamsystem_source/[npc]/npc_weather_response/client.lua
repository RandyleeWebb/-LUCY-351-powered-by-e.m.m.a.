
CreateThread(function()
    while true do
        Wait(30000) -- Check every 30 seconds
        local weather = GetPrevWeatherTypeHashName()

        if weather == `RAIN` or weather == `THUNDER` then
            SetPedDensityMultiplierThisFrame(0.4)
            SetVehicleDensityMultiplierThisFrame(0.6)
            SetRandomVehicleDensityMultiplierThisFrame(0.5)
            SetParkedVehicleDensityMultiplierThisFrame(0.8)
            TriggerEvent("chat:addMessage", {args = {"System", "^1Heavy rain is slowing traffic and pedestrians."}})
        elseif weather == `FOGGY` or weather == `SMOG` then
            SetVehicleDensityMultiplierThisFrame(0.5)
            SetPedDensityMultiplierThisFrame(0.7)
            TriggerEvent("chat:addMessage", {args = {"System", "^3Fog detected. Visibility is low."}})
        elseif weather == `CLEARING` or weather == `OVERCAST` then
            SetVehicleDensityMultiplierThisFrame(0.7)
            SetPedDensityMultiplierThisFrame(0.8)
        else
            -- Restore standard levels
            SetPedDensityMultiplierThisFrame(0.85)
            SetVehicleDensityMultiplierThisFrame(0.85)
        end
    end
end)
