<!DOCTYPE html>
<html>
    <head>
        <title>CheckAutopista</title>

        <link href='http://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'>                               <!-- Google Fonts -->
        <link rel="stylesheet" type="text/css" href="css/stylesheetmobile.css" media="screen  and (max-width: 40.5em),handheld" />  <!-- CSS para mobile -->
        <link rel="stylesheet" type="text/css" href="css/stylesheet.css" media="screen  and (min-width: 40.5em)" />                 <!-- CSS para desktop -->
        <meta name="viewport" content="width=device-width, target-densitydpi=high-dpi, user-scalable=0" />                          <!-- iPhone -->
        <meta http-equiv="Content-Type" content="application/vnd.wap.xhtml+xml; charset=utf-8" />                                   <!-- iPhone -->
        <meta name="HandheldFriendly" content="true" />                                                                             <!-- iPhone -->
        <meta name="apple-mobile-web-app-capable" content="yes" />                                                                  <!-- iPhone -->
        <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />                                         <!-- Leaflet-js -->
        <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>                                                   <!-- Leaflet-js -->
        <script src='js/osmtogeojson.js'></script>                                                                                  <!-- osmtogeojsom -->
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">                        <!-- LocateControl -->
        <link rel="stylesheet" href="//rawgithub.com/domoritz/leaflet-locatecontrol/gh-pages/src/L.Control.Locate.css" />           <!-- LocateControl -->
        <script src="//rawgithub.com/domoritz/leaflet-locatecontrol/gh-pages/src/L.Control.Locate.js" ></script>                    <!-- LocateControl -->
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>                                    <!-- jQuery -->
        <script src="js/purl.js"></script>                                                                                          <!-- allmarkedup/purl -->
        
    </head>
    <body>
        <div id="header">
            <img id="emblema" src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Spain_traffic_signal_s1.svg" height=100px />
            <div id="headerright">
                <div id="logo"><span id="txtlogo1">Check<span id="txtlogo2">Autopista</span></span></div>
                <div id="byk1wi">by&nbsp<a href="http://www.openstreetmap.org/user/k1wi">k1wi</a>.</div>
                <div id="lema">Herramienta de control de calidad de las autopistas españolas en la base de datos de OSM.</div>
            </div>
        </div>
        <div id="selector">
            <ul>
                <li>Selecciona la autopista:</li>
                <li>
                    <form>
                        <select name="a"></select>
                        <input name="submit" type="submit" value="Ver" />
                    </form>
                </li>
                <br/>
                <li><b>Leyenda</b></li>
                <li><div class="boton" id="peaje"></div><div class="leyenda_text">Peaje</div></li>
                <li><div class="boton" id="sal_ref_exit_to"></div><div class="leyenda_text">Salida con <span class="code">ref</span> y <span class="code">exit_to</span></div></li>
                <li><div class="boton" id="sal_ref_name"></div><div class="leyenda_text">Salida con <span class="code">ref</span> y <span class="code">name</span></div></li>
                <li><div class="boton" id="sal_ref"></div><div class="leyenda_text">Salida sólo con <span class="code">ref</span></div></li>
                <li><div class="boton" id="sal_no_ref"></div><div class="leyenda_text">Salida sin <span class="code">ref</span></div></li>
                <br/>
                <li><div class="linea" id="via_todo"></div><div class="leyenda_text">Vía completa</div></li>
                <li><div class="linea" id="via_falta_algo"></div><div class="leyenda_text">Vía sin <span class="code">maxspeed</span> o <span class="code">lanes</span></div></li>
                <li><div class="linea" id="via_no_name"></div><div class="leyenda_text">Vía sin <span class="code">name</span></div></li>    
                <li><div class="linea" id="via_construccion"></div><div class="leyenda_text">En construcción</div></li>   
                <br/>
                <li><b>Atención:</b> CheckAutopista no tiene en cuenta las salidas marcadas con <span class="code">destination</span>.</li>          
        </div>
        <div id="map">
            <script src="js/prepareMap.js"></script>
            <script src="js/addData.js"></script>
            <script src="js/getData.js"></script>
            <script>
            $(document).ready(function(){
                var autopista = ["A-1", "AP-1", "A-2", "AP-2", "A-3", "A-4", "AP-4", "A-5", "A-6", "AP-6", "A-7", "AP-7", "A-8", "AP-8", "AP-9","A-10", "A-11", "A-12", "A-13", "A-14", "A-15", "AP-15", "A-16", "A-17", "A-18", "A-19", "A-21", "A-22", "A-23", "A-26", "A-27", "A-30", "A-31", "A-32", "A-33", "A-35", "AP-36", "A-38", "A-40", "A-41", "AP-41", "A-42", "A-43", "A-44", "A-45", "A-46", "A-47", "A-48", "A-49", "A-50", "AP-51", "A-52", "AP-53", "A-54", "A-55", "A-58", "A-60", "AP-61", "A-62", "A-63", "A-64", "A-65", "A-66", "AP-66", "A-67", "A-68", "AP-68", "A-70", "AP-71", "A-73", "A-75", "A-91", "A-92", "A-92M"];
                for (var i = 0; i<74; i++) {
                    if (autopista[i] == a) {
                        $("select[name=a]").append('<option value="' + autopista[i] + '" selected>' + autopista[i] + '</option>');
                    } else {
                        $("select[name=a]").append('<option value="' + autopista[i] + '">' + autopista[i] + '</option>');
                    }
                }
            });
            </script>
        </div>
        <div id="ad">
    </body>
</html>