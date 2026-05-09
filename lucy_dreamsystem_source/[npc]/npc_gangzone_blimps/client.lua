
CreateThread(function()
    for _, blip in pairs(Config.GangZones) do
        local b = AddBlipForCoord(blip.coords.x, blip.coords.y, blip.coords.z)
        SetBlipSprite(b, blip.sprite)
        SetBlipDisplay(b, 4)
        SetBlipScale(b, 0.9)
        SetBlipColour(b, blip.color)
        SetBlipAsShortRange(b, true)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(blip.label)
        EndTextCommandSetBlipName(b)
    end
end)
