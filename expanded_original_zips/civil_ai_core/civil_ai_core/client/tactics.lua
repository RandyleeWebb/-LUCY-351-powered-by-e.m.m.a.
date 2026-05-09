RegisterNetEvent('civil_ai_core:deployRoadblock', function(coords)
    for _, objName in ipairs(Config.Tactics.RoadblockObjects) do
        local model = GetHashKey(objName)
        RequestModel(model)
        while not HasModelLoaded(model) do Wait(0) end
        local obj = CreateObject(model, coords.x + math.random(-3,3), coords.y + math.random(-3,3), coords.z, true, true, false)
        PlaceObjectOnGroundProperly(obj)
    end
end)

RegisterNetEvent('civil_ai_core:spawnAirSupport', function(coords)
    local model = GetHashKey(Config.Tactics.AirSupportModel)
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end
    local heli = CreateVehicle(model, coords.x, coords.y, coords.z + 60.0, 0.0, true, false)
    TaskHeliMission(heli, 0, 0, PlayerPedId(), coords.x, coords.y, coords.z, 23, 30.0, 10.0, -1, 0, 0, 0, 0)
end)
