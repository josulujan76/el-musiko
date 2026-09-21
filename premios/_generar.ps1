Add-Type -AssemblyName System.Drawing

$out = "c:\Users\banmi\Downloads\juego\JuegoMusico\premios"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function C([int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

function Save-Icon([string]$name, [scriptblock]$draw) {
  $bmp = New-Object System.Drawing.Bitmap 128, 128
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 18, 16, 22))
  & $draw $g
  $bmp.Save((Join-Path $out ($name + ".png")), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Circle($g, $color, $x, $y, $s) {
  $br = New-Object System.Drawing.SolidBrush $color
  $g.FillEllipse($br, [int]$x, [int]$y, [int]$s, [int]$s)
  $br.Dispose()
}

function Poly($g, $color, $pairs) {
  $br = New-Object System.Drawing.SolidBrush $color
  $points = New-Object System.Drawing.Point[] $pairs.Count
  for ($i = 0; $i -lt $pairs.Count; $i++) {
    $points[$i] = New-Object System.Drawing.Point ([int]$pairs[$i][0]), ([int]$pairs[$i][1])
  }
  $g.FillPolygon($br, $points)
  $br.Dispose()
}

function Rect($g, $color, $x, $y, $w, $h) {
  $br = New-Object System.Drawing.SolidBrush $color
  $g.FillRectangle($br, [int]$x, [int]$y, [int]$w, [int]$h)
  $br.Dispose()
}

$bg = C 18 16 22
$gold = C 212 175 55
$bronze = C 176 122 64
$silver = C 198 205 214
$plat = C 214 226 232
$teal = C 56 163 165
$purple = C 122 92 180
$green = C 62 168 90
$red = C 196 62 62
$wine = C 164 48 72
$copper = C 196 118 58
$magenta = C 188 64 140
$blue = C 64 110 188
$cyan = C 92 210 214
$ice = C 160 210 230
$amber = C 230 168 52
$cream = C 255 250 235

Save-Icon "batalla-de-bandas-de-la-ciudad" {
  param($g)
  Circle $g $bronze 12 12 104
  Rect $g $cream 56 40 16 36
  Poly $g $cream @(@(48,40), @(80,40), @(64,22))
  Rect $g $cream 44 76 40 10
}

Save-Icon "revelacion-de-radio-fm" {
  param($g)
  Circle $g $teal 12 12 104
  Circle $g $cream 50 50 28
  Circle $g $teal 58 58 12
  $pen = New-Object System.Drawing.Pen $cream, 5
  $g.DrawArc($pen, 28, 28, 72, 72, 200, 140)
  $g.DrawArc($pen, 18, 18, 92, 92, 200, 140)
  $pen.Dispose()
}

Save-Icon "mejor-artista-del-circuito-independiente" {
  param($g)
  Circle $g $purple 12 12 104
  Poly $g $cream @(@(64,22), @(74,50), @(104,50), @(80,68), @(90,98), @(64,80), @(38,98), @(48,68), @(24,50), @(54,50))
}

Save-Icon "premio-gardel-mejor-nuevo-artista" {
  param($g)
  Circle $g $silver 12 12 104
  Rect $g $bg 50 36 12 40
  Rect $g $bg 50 36 28 12
  Rect $g $bg 50 54 22 12
}

Save-Icon "disco-de-oro" {
  param($g)
  Circle $g $gold 14 14 100
  Circle $g $bg 52 52 24
}

Save-Icon "n-1-mas-escuchado-en-spotify" {
  param($g)
  Circle $g $green 12 12 104
  Rect $g $cream 52 32 12 48
  Rect $g $cream 40 32 36 12
  Rect $g $cream 40 68 36 12
}

Save-Icon "n-1-videoclip-de-youtube" {
  param($g)
  Circle $g $red 12 12 104
  Poly $g $cream @(@(46,36), @(90,64), @(46,92))
}

Save-Icon "gaviota-de-plata-vina-del-mar" {
  param($g)
  Circle $g $silver 12 12 104
  Poly $g $bg @(@(28,74), @(64,30), @(100,74), @(64,58))
}

Save-Icon "gardel-de-oro" {
  param($g)
  Circle $g $gold 12 12 104
  Rect $g $bg 50 34 12 44
  Rect $g $bg 50 34 30 12
  Rect $g $bg 50 52 24 12
  Circle $g $bg 78 70 10
}

Save-Icon "premio-gardel-cancion-del-ano" {
  param($g)
  Circle $g $amber 12 12 104
  Rect $g $cream 70 32 10 44
  Circle $g $cream 48 68 28
  Circle $g $amber 56 76 12
}

Save-Icon "disco-de-platino" {
  param($g)
  Circle $g $plat 14 14 100
  Circle $g $bg 52 52 24
}

Save-Icon "gaviota-de-oro-vina-del-mar" {
  param($g)
  Circle $g $gold 12 12 104
  Poly $g $bg @(@(28,74), @(64,30), @(100,74), @(64,58))
}

Save-Icon "latin-grammy" {
  param($g)
  Circle $g $copper 12 12 104
  Circle $g $cream 48 28 32
  Rect $g $cream 60 56 8 28
  Rect $g $cream 48 82 32 10
}

Save-Icon "mtv-ema" {
  param($g)
  Circle $g $magenta 12 12 104
  Poly $g $cream @(@(70,24), @(40,64), @(58,64), @(50,104), @(88,54), @(68,54))
}

Save-Icon "billboard-latin-music-award" {
  param($g)
  Circle $g $blue 12 12 104
  Rect $g $cream 36 64 16 28
  Rect $g $cream 56 44 16 48
  Rect $g $cream 76 32 16 60
}

Save-Icon "multiplatino" {
  param($g)
  Circle $g $plat 8 28 72
  Circle $g $bg 32 52 24
  Circle $g $plat 48 28 72
  Circle $g $bg 72 52 24
}

Save-Icon "grammy" {
  param($g)
  Circle $g $gold 12 12 104
  Circle $g $bg 44 24 40
  Circle $g $gold 52 32 24
  Rect $g $bg 60 58 8 30
  Rect $g $bg 46 86 36 10
}

Save-Icon "disco-de-diamante" {
  param($g)
  Poly $g $cyan @(@(64,10), @(118,64), @(64,118), @(10,64))
  Poly $g $bg @(@(64,34), @(94,64), @(64,94), @(34,64))
}

Save-Icon "polar-music-prize" {
  param($g)
  Circle $g $ice 12 12 104
  Poly $g $bg @(@(64,22), @(70,54), @(104,54), @(76,72), @(86,104), @(64,84), @(42,104), @(52,72), @(24,54), @(58,54))
}

Save-Icon "latin-grammy-persona-del-ano" {
  param($g)
  Circle $g $wine 12 12 104
  Circle $g $cream 48 28 32
  Poly $g $cream @(@(40,64), @(88,64), @(96,96), @(32,96))
}

Save-Icon "default" {
  param($g)
  Circle $g (C 80 78 88) 12 12 104
  Rect $g $cream 60 36 8 32
  Circle $g $cream 58 76 12
}

Write-Output "OK $($(Get-ChildItem $out -Filter *.png).Count) png"
