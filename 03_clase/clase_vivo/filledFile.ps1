# Versión optimizada usando StringBuilder y escritura por bloques
$tamañoDeseado = 10MB
$archivo = "nombres_random.txt"

$nombres = @("Juan", "Maria", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Sofia", 
             "Diego", "Valentina", "Andres", "Camila", "Javier", "Isabella", 
             "Fernando", "Daniela", "Ricardo", "Paula", "Sergio", "Laura")

$apellidos = @("Garcia", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Perez", 
               "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Morales", 
               "Ortiz", "Reyes", "Diaz", "Castro", "Romero", "Silva", "Mendoza")

$builder = New-Object System.Text.StringBuilder
$tamañoActual = 0

while ($tamañoActual -lt $tamañoDeseado) {
    $nombre = $nombres[(Get-Random -Maximum $nombres.Count)]
    $apellido1 = $apellidos[(Get-Random -Maximum $apellidos.Count)]
    $apellido2 = $apellidos[(Get-Random -Maximum $apellidos.Count)]
    
    $linea = "$nombre $apellido1 $apellido2`r`n"
    [void]$builder.Append($linea)
    $tamañoActual += [System.Text.Encoding]::UTF8.GetByteCount($linea)
    
    # Cada 1000 líneas, escribir al archivo para optimizar memoria
    if ($builder.Length -gt 500000) {
        [System.IO.File]::AppendAllText($archivo, $builder.ToString())
        $builder.Clear()
    }
}

# Escribir lo que queda
if ($builder.Length -gt 0) {
    [System.IO.File]::AppendAllText($archivo, $builder.ToString())
}

Write-Host "Archivo creado exitosamente: $archivo"
$tamañoFinal = (Get-Item $archivo).Length
Write-Host "Tamaño real: $([math]::Round($tamañoFinal/1MB, 2)) MB"