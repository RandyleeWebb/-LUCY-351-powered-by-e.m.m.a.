LucyMenuOpen = false
local selected = 1
local options = {
    { label = 'Set role: Police', action = function() TriggerServerEvent('lucy_framework:server:setRole', 'police') end },
    { label = 'Set role: EMS', action = function() TriggerServerEvent('lucy_framework:server:setRole', 'ems') end },
    { label = 'Set role: Trucker', action = function() TriggerServerEvent('lucy_framework:server:setRole', 'trucker') end },
    { label = 'Set role: Gang', action = function() TriggerServerEvent('lucy_framework:server:setRole', 'gang') end },
    { label = 'Set role: Civilian', action = function() TriggerServerEvent('lucy_framework:server:setRole', 'civilian') end },
    { label = 'Request Lucy Mission', action = function() TriggerServerEvent('lucy_framework:server:requestMission') end },
    { label = 'Close', action = function() LucyMenuOpen = false end }
}

local function drawText(x, y, scale, text, r, g, b, a)
    SetTextFont(4)
    SetTextScale(scale, scale)
    SetTextColour(r or 255, g or 255, b or 255, a or 255)
    SetTextOutline()
    BeginTextCommandDisplayText('STRING')
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayText(x, y)
end

CreateThread(function()
    while true do
        local sleep = 500
        if LucyMenuOpen then
            sleep = 0
            DrawRect(0.18, 0.32, 0.28, 0.42, 10, 16, 28, 220)
            drawText(0.06, 0.13, 0.42, 'Lucy Standalone Menu', 120, 180, 255, 255)
            for i, option in ipairs(options) do
                local prefix = selected == i and '~b~> ' or '  '
                drawText(0.07, 0.16 + (i * 0.035), 0.32, prefix .. option.label, 255, 255, 255, 255)
            end
            if IsControlJustPressed(0, 172) then selected = selected - 1 end -- up
            if IsControlJustPressed(0, 173) then selected = selected + 1 end -- down
            if selected < 1 then selected = #options end
            if selected > #options then selected = 1 end
            if IsControlJustPressed(0, 176) or IsControlJustPressed(0, 201) then options[selected].action() end -- enter/A
            if IsControlJustPressed(0, 177) then LucyMenuOpen = false end -- back/B
        end
        Wait(sleep)
    end
end)
