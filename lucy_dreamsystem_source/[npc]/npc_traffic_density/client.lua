
CreateThread(function()
    while true do
        Wait(30000) -- check every 30 seconds
        local hour = GetClockHours()

        if hour >= 7 and hour <= 9 then -- Morning rush
            SetPedDensityMultiplierThisFrame(1.0)
            SetVehicleDensityMultiplierThisFrame(1.2)
            SetRandomVehicleDensityMultiplierThisFrame(1.1)
            SetParkedVehicleDensityMultiplierThisFrame(0.6)
        elseif hour >= 17 and hour <= 19 then -- Evening rush
            SetPedDensityMultiplierThisFrame(0.9)
            SetVehicleDensityMultiplierThisFrame(1.2)
            SetRandomVehicleDensityMultiplierThisFrame(1.0)
            SetParkedVehicleDensityMultiplierThisFrame(0.7)
        elseif hour >= 22 or hour <= 4 then -- Late night quiet
            SetPedDensityMultiplierThisFrame(0.3)
            SetVehicleDensityMultiplierThisFrame(0.4)
            SetRandomVehicleDensityMultiplierThisFrame(0.2)
            SetParkedVehicleDensityMultiplierThisFrame(0.9)
        else -- Normal daytime
            SetPedDensityMultiplierThisFrame(0.8)
            SetVehicleDensityMultiplierThisFrame(0.8)
            SetRandomVehicleDensityMultiplierThisFrame(0.6)
            SetParkedVehicleDensityMultiplierThisFrame(0.6)
        end
    end
end)
