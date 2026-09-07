export interface CuentaCorriente {
  id: string;
  nombre: string;
  unidadNegocio: string;
  saldoFacturable: number;
  moneda: 'CLP' | 'UF' | 'USD';
  estado: 'Activa' | 'Bloqueada';
}

export interface CondicionCliente {
  tieneCargaValorada: boolean;
  cargaValorada: string;
  tieneConsolidado: boolean;
  consolidado: string;
  tieneDescuento: boolean;
  descuento: string;
  tarifa?: string;
}

export interface ClienteReal {
  rut: string;
  rutFormateado: string;
  razonSocial: string;
  cuentasCorrientes: CuentaCorriente[];
  condicionesGenerales: CondicionCliente;
}

function formatRutChileno(rutNumStr: string): string {
  const clean = rutNumStr.replace(/\D/g, '');
  if (!clean) return rutNumStr;
  
  let count = 2;
  let sum = 0;
  for (let i = clean.length - 1; i >= 0; i--) {
    sum += parseInt(clean.charAt(i), 10) * count;
    count = count === 7 ? 2 : count + 1;
  }
  const rem = 11 - (sum % 11);
  const dv = rem === 11 ? '0' : rem === 10 ? 'K' : rem.toString();
  
  const bodyFormatted = Number(clean).toLocaleString('es-CL');
  return `${bodyFormatted}-${dv}`;
}

const CUSTOM_ACCOUNTS: Record<string, CuentaCorriente[]> = {
  "81201000": [ // CENCOSUD RETAIL S.A.
    { id: "CTA-001", nombre: "Cencosud - Santa Isabel", unidadNegocio: "Supermercados", saldoFacturable: 9000000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-002", nombre: "Cencosud - Easy", unidadNegocio: "Hogar y Construcción", saldoFacturable: 15500000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-003", nombre: "Cencosud - Marketplace", unidadNegocio: "E-Commerce", saldoFacturable: 4200000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-004", nombre: "Cencosud - Jumbo Express", unidadNegocio: "Supermercados Premium", saldoFacturable: 12000000, moneda: "CLP", estado: "Activa" },
  ],
  "76212492": [ // FALABELLA.COM SPA
    { id: "CTA-101", nombre: "Falabella Retail Central", unidadNegocio: "Tiendas por Departamento", saldoFacturable: 25000000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-102", nombre: "Falabella Marketplace Crossborder", unidadNegocio: "E-Commerce Internacional", saldoFacturable: 18000000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-103", nombre: "Sodimac Constructor", unidadNegocio: "Mejoramiento del Hogar", saldoFacturable: 8900000, moneda: "CLP", estado: "Activa" },
  ],
  "97036000": [ // BANCO SANTANDER CHILE
    { id: "CTA-201", nombre: "Santander Casa Matriz Santiago", unidadNegocio: "Banca Corporativa", saldoFacturable: 30000000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-202", nombre: "Santander Distribución Tarjetas", unidadNegocio: "Logística Valorada", saldoFacturable: 14000000, moneda: "CLP", estado: "Activa" },
  ],
  "76727392": [ // BUBBA CHILE SPA
    { id: "CTA-301", nombre: "Bubba Bags E-Commerce Directo", unidadNegocio: "Retail / Venta Directa", saldoFacturable: 3500000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-302", nombre: "Bubba Mayoristas Regiones", unidadNegocio: "Distribución B2B", saldoFacturable: 6800000, moneda: "CLP", estado: "Activa" },
  ],
  "76507443": [ // DECATHLON CHILE SPA
    { id: "CTA-401", nombre: "Decathlon Tiendas Físicas Región Metropolitana", unidadNegocio: "Retail Deportivo", saldoFacturable: 11200000, moneda: "CLP", estado: "Activa" },
    { id: "CTA-402", nombre: "Decathlon Online & Click-and-Collect", unidadNegocio: "E-Commerce", saldoFacturable: 7400000, moneda: "CLP", estado: "Activa" },
  ],
};

function generateDefaultAccounts(rut: string, razonSocial: string): CuentaCorriente[] {
  return [
    {
      id: `CTA-${rut.slice(-3)}-01`,
      nombre: `${razonSocial} - Cuenta Principal`,
      unidadNegocio: "Operaciones Generales",
      saldoFacturable: 5000000 + (parseInt(rut.slice(-4), 10) || 1000) * 1000,
      moneda: "CLP",
      estado: "Activa",
    },
    {
      id: `CTA-${rut.slice(-3)}-02`,
      nombre: `${razonSocial} - Sucursales / Regiones`,
      unidadNegocio: "Logística Regional",
      saldoFacturable: 2500000 + (parseInt(rut.slice(-3), 10) || 500) * 800,
      moneda: "CLP",
      estado: "Activa",
    },
  ];
}

const RAW_CLIENTES = [
  { rut: "91806000", razonSocial: "ABASTIBLE S.A." },
  { rut: "96609940", razonSocial: "ACT S.A." },
  { rut: "76134941", razonSocial: "ADMINISTRADORA DE SUPERMERCADOS HIPER LT" },
  { rut: "62000720", razonSocial: "ALMACEN MILITAR DEL EJERCITO" },
  { rut: "96911930", razonSocial: "AMF IMPRESION VARIABLE SPA" },
  { rut: "85275700", razonSocial: "ARRENDAMIENTO DE MAQUINARIAS SPA" },
  { rut: "77347485", razonSocial: "ASIABOX SPA" },
  { rut: "96928530", razonSocial: "ASTARA RETAIL CHILE SPA" },
  { rut: "83547100", razonSocial: "AUTORENTAS DEL PACIFICO SPA" },
  { rut: "76625038", razonSocial: "AVL SERVICIOS GENERALES SPA" },
  { rut: "86708800", razonSocial: "BADAMAX RETAIL S.A" },
  { rut: "97036000", razonSocial: "BANCO SANTANDER CHILE" },
  { rut: "78295500", razonSocial: "BICICLETAS BELDA LIMITADA" },
  { rut: "76170285", razonSocial: "BIG FOOT CHILE SPA MARKETPLACE" },
  { rut: "76145457", razonSocial: "BIJOU CHILE SPA" },
  { rut: "77328899", razonSocial: "BRANDLIVE SPA" },
  { rut: "76802814", razonSocial: "BRANDO SPA" },
  { rut: "76727392", razonSocial: "BUBBA CHILE SPA" },
  { rut: "99599760", razonSocial: "CASINO DE JUEGOS DEL PACIFICO S.A" },
  { rut: "70016160", razonSocial: "CCAF La AraucanaA F" },
  { rut: "81201000", razonSocial: "CENCOSUD RETAIL S.A." },
  { rut: "96547580", razonSocial: "CEPECH SPA" },
  { rut: "78947550", razonSocial: "CEVA FREIGHT MANAGEMENT LOGISTICA DE CHI" },
  { rut: "77406138", razonSocial: "CHILEAN NETWORK SPA" },
  { rut: "77235177", razonSocial: "CLICKEX SPA" },
  { rut: "96532330", razonSocial: "CMPC PULP SPA" },
  { rut: "76646514", razonSocial: "COMERCIAL ADELE SPA" },
  { rut: "77358700", razonSocial: "COMERCIAL CARDEPOT LTDA" },
  { rut: "76421739", razonSocial: "COMERCIAL DIWEB LIMITADA" },
  { rut: "78464140", razonSocial: "COMERCIAL E INDUSTRIAL STROLLER SPA" },
  { rut: "83382700", razonSocial: "COMERCIAL ECCSA S.A." },
  { rut: "96572360", razonSocial: "COMERCIAL KAUFMANN S.A." },
  { rut: "76005909", razonSocial: "COMERCIAL MOTORES DE LOS ANDES SPA" },
  { rut: "78737870", razonSocial: "COMERCIAL PICHARA SPA" },
  { rut: "76057517", razonSocial: "COMERCIAL UNDER SPA." },
  { rut: "76585785", razonSocial: "COMERCIALIZADORA MAXYSALES PRO SPA" },
  { rut: "77371171", razonSocial: "DARKSTORE SPA" },
  { rut: "76507443", razonSocial: "DECATHLON CHILE SPA" },
  { rut: "76074938", razonSocial: "DEPORTES SPARTA SPA" },
  { rut: "92083000", razonSocial: "DIMACOFI S.A." },
  { rut: "77393481", razonSocial: "DROPI SPA" },
  { rut: "96930480", razonSocial: "DUTY FREE T C S.A." },
  { rut: "76568660", razonSocial: "EASY RETAIL S.A." },
  { rut: "76205521", razonSocial: "ECOMSUR S.A" },
  { rut: "96539380", razonSocial: "EDICIONES FINANCIERAS S A" },
  { rut: "76163495", razonSocial: "ELECTROLUX DE CHILE S.A." },
  { rut: "83162400", razonSocial: "EMARESA INGENIEROS Y REPRESENTACIONES S." },
  { rut: "91144000", razonSocial: "EMBOTELLADORA ANDINA S.A." },
  { rut: "80314700", razonSocial: "EMPRESA DE TRANSPORTES RURALES SPA" },
  { rut: "96803690", razonSocial: "Empresas Dmg Sa" },
  { rut: "76924079", razonSocial: "ENEL X CHILE SPA" },
  { rut: "77569067", razonSocial: "ENEL X WAY CHILE SPA" },
  { rut: "76669508", razonSocial: "ENVIAME LATAM SPA" },
  { rut: "96937270", razonSocial: "EULEN CHILE S.A" },
  { rut: "96937250", razonSocial: "EULEN SEGURIDAD SA" },
  { rut: "94528000", razonSocial: "EVERCRISP SNACK PRODUCTOS DE CHILE S.A." },
  { rut: "76212492", razonSocial: "FALABELLA.COM SPA" },
  { rut: "91489000", razonSocial: "FINNING CHILE S A" },
  { rut: "76129552", razonSocial: "Flores Comercial S.A." },
  { rut: "92987000", razonSocial: "FLORES Y COMPANIA SA." },
  { rut: "86963200", razonSocial: "FORUS S A" },
  { rut: "65044442", razonSocial: "FUNDAC EDUCACIONAL CRECER CON TODOS" },
  { rut: "65175180", razonSocial: "FUNDACION ARTESANIAS DE CHILE" },
  { rut: "96912870", razonSocial: "G4S SECURITY SERVICES REGIONES S.A." },
  { rut: "78806090", razonSocial: "GAMA CHILE S.A." },
  { rut: "96605880", razonSocial: "GOLDENFROST S.A." },
  { rut: "96997370", razonSocial: "GRUPO EULEN CHILE S.A." },
  { rut: "76142991", razonSocial: "GRUPO REPLIKA SPA" },
  { rut: "78972190", razonSocial: "HANNA INSTRUMENTS EQUIPOS LTDA." },
  { rut: "78882180", razonSocial: "HERBALIFE CHILE LTDA." },
  { rut: "93217000", razonSocial: "HINO CHILE S.A." },
  { rut: "81675600", razonSocial: "HITES S.A." },
  { rut: "76758790", razonSocial: "HYUNDAI VEHICULOS COMERCIALES CHILE S.A." },
  { rut: "99522260", razonSocial: "IMEGA VENTUS SPA" },
  { rut: "96763560", razonSocial: "IMPORTADORA MIDEA CARRIER CHILE LTDA." },
  { rut: "77247460", razonSocial: "Importadora Police Sociedad Anonima" },
  { rut: "96856360", razonSocial: "INCHCAPE AUTOMOTRIZ CHILE S.A." },
  { rut: "79996010", razonSocial: "INSTITUTO PROFESIONAL PROVIDENCIA" },
  { rut: "96705940", razonSocial: "INTCOMEX S.A." },
  { rut: "76107293", razonSocial: "INTEGRO CORP SPA" },
  { rut: "76979167", razonSocial: "INVERSIONES SEBASTIAN ROJAS AYALA" },
  { rut: "99595770", razonSocial: "INVERSIONES VISTA NORTE S.A." },
  { rut: "96915330", razonSocial: "IQUIQUE TERMINAL INTERNACIONAL S.A." },
  { rut: "96756680", razonSocial: "IRON MOUNTAIN CHILE S.A." },
  { rut: "76510834", razonSocial: "JUMPSELLER SPA" },
  { rut: "92475000", razonSocial: "KAUFMANN S.A." },
  { rut: "79567420", razonSocial: "KIA CHILE SPA" },
  { rut: "96999930", razonSocial: "KITCHEN CENTER SPA" },
  { rut: "76204622", razonSocial: "KP INGENIERIA LOGISTICA SPA" },
  { rut: "96725460", razonSocial: "KUDEN S.A." },
  { rut: "78114650", razonSocial: "LECHNER S.A." },
  { rut: "88249000", razonSocial: "LEIN S.A." },
  { rut: "96847110", razonSocial: "LIMCHILE S A" },
  { rut: "78954200", razonSocial: "LOGISTICA TRANSPORTE Y SERVICIOS LTS LIM" },
  { rut: "79693930", razonSocial: "LOREAL CHILE S.A." },
  { rut: "96891370", razonSocial: "LUXOTTICA OF CHILE S.A." },
  { rut: "76265705", razonSocial: "LX PANTOS CHILE SPA" },
  { rut: "76741394", razonSocial: "MACROTRANS SPA" },
  { rut: "82164300", razonSocial: "Manzano Y Cia Ltda" },
  { rut: "93320000", razonSocial: "MARIENBERG SPA" },
  { rut: "96623540", razonSocial: "MATIC KARD S.A." },
  { rut: "76322590", razonSocial: "MATRIZ IDEAS S A" },
  { rut: "76988939", razonSocial: "MINI BF CHILE SPA" },
  { rut: "77479063", razonSocial: "MOTORES DE LOS ANDES VEHICULOS MOTORIZAD" },
  { rut: "83150900", razonSocial: "MULTITIENDAS CORONA S.A." },
  { rut: "96575280", razonSocial: "NATURA COSMETICOS S.A." },
  { rut: "99597870", razonSocial: "OPERACIONES EL ESCORIAL S.A." },
  { rut: "96940320", razonSocial: "OPERACIONES INTEGRALES COQUIMBO LTD" },
  { rut: "99597250", razonSocial: "OPERACIONES INTEGRALES ISLA" },
  { rut: "96541470", razonSocial: "ORIFLAME DE CHILE S.A." },
  { rut: "77538757", razonSocial: "PCF RETAIL SPA" },
  { rut: "96877150", razonSocial: "PEÑ A SPOERER Y CIA S.A" },
  { rut: "78885550", razonSocial: "PERSONAL COMPUTER FACTORY S.A." },
  { rut: "76238635", razonSocial: "PESCO RENTAL S.A" },
  { rut: "77050495", razonSocial: "PETCO CHILE SPA" },
  { rut: "81698900", razonSocial: "PONTIFICIA UNIVERSIDAD CATOLICA" },
  { rut: "92117000", razonSocial: "PROA S.A." },
  { rut: "78103320", razonSocial: "PRODUCTOS MITRE LTDA" },
  { rut: "88887900", razonSocial: "PUMA CHILE SPA" },
  { rut: "99598510", razonSocial: "RANTRUR S.A." },
  { rut: "76174439", razonSocial: "RECARGAS COMERCIALIZACION Y TECNOLOGIA S" },
  { rut: "76169895", razonSocial: "ROLLMIX SPA" },
  { rut: "76360883", razonSocial: "SAIC MOTOR SUDAMERICA SPA" },
  { rut: "76413209", razonSocial: "SAMSUNG SDS GLOBAL SCL CHILE LTDA." },
  { rut: "76951696", razonSocial: "SAN ANTONIO HOTELES II SPA" },
  { rut: "76886019", razonSocial: "SENDU SPA" },
  { rut: "77454346", razonSocial: "SERVICIOS INTEGRALES L&S CHILE SPA" },
  { rut: "77057527", razonSocial: "SERVICIOS INTEGRALES L&S SPA" },
  { rut: "76499449", razonSocial: "SHIPIT SPA" },
  { rut: "76576352", razonSocial: "SINERGIA TRADE CHILE SPA." },
  { rut: "77374625", razonSocial: "SMART BUSINESS CHILE SPA" },
  { rut: "77312214", razonSocial: "SOC. COM. Y DE ASESORIAS UNITRADE SPA" },
  { rut: "77190692", razonSocial: "SOC.OP.DE TARJETAS DE PAGO SANTANDER GET" },
  { rut: "77374898", razonSocial: "SOCIEDAD COMERCIAL ORGANIC SOLUTIONS SPA" },
  { rut: "76099978", razonSocial: "SOCIEDAD CONCESIONARIA AUTOPISTAS DE ANT" },
  { rut: "76727730", razonSocial: "SOCIEDAD DE SERVICIOS TRANSACCIONALES CA" },
  { rut: "76391998", razonSocial: "STRIPES CHILE SPA" },
  { rut: "76548828", razonSocial: "SWISS NATURE LABS SPA" },
  { rut: "77194482", razonSocial: "SWISS TRADING COMPANY SPA" },
  { rut: "90635000", razonSocial: "TELEFONICA CHILE S.A." },
  { rut: "77214017", razonSocial: "TENDENCYS INNOVATIONS CHILE SPA" },
  { rut: "99505050", razonSocial: "TEXTIL VELUTTI S.A." },
  { rut: "76192989", razonSocial: "THECOM LTDA." },
  { rut: "76744700", razonSocial: "TITANIO S.A." },
  { rut: "96931250", razonSocial: "TRANSLOGIC S.A" },
  { rut: "96808570", razonSocial: "TW LOGISTICA SPA" },
  { rut: "76058647", razonSocial: "VERISURE CHILE SPA" },
  { rut: "91041000", razonSocial: "VINA SAN PEDRO TARAPACA S.A." },
  { rut: "96785860", razonSocial: "ZARA CHILE S A" },
];

const CUSTOM_CONDICIONES: Record<string, CondicionCliente> = {
  "81201000": { // CENCOSUD
    tieneCargaValorada: true,
    cargaValorada: "Aplica cobertura valorada 0.8% del valor declarado (Máx 500 UF).",
    tieneConsolidado: true,
    consolidado: "Consolidación (Por Centro de Distribución y Fecha de Entrega).",
    tieneDescuento: true,
    descuento: "Descuento del 15% por volumen mensual de envíos.",
  },
  "76212492": { // FALABELLA
    tieneCargaValorada: true,
    cargaValorada: "Aplica cobertura valorada 0.8% del valor declarado (Máx 500 UF).",
    tieneConsolidado: true,
    consolidado: "Consolidación (Por mismo cliente final y destino).",
    tieneDescuento: true,
    descuento: "Descuento del 10% por convenio comercial e-commerce.",
  },
  "97036000": { // SANTANDER
    tieneCargaValorada: true,
    cargaValorada: "Aplica cobertura valorada 1.2% del valor declarado (Seguro de custodia UF).",
    tieneConsolidado: true,
    consolidado: "Consolidación (Por sucursal bancaria de destino).",
    tieneDescuento: true,
    descuento: "Descuento del 5% por convenio corporativo banca.",
  },
  "76727392": { // BUBBA
    tieneCargaValorada: false,
    cargaValorada: "Sin carga valorada.",
    tieneConsolidado: false,
    consolidado: "Sin consolidación.",
    tieneDescuento: false,
    descuento: "Sin descuento.",
  },
  "76507443": { // DECATHLON
    tieneCargaValorada: true,
    cargaValorada: "Aplica cobertura valorada 0.5% del valor declarado (Estándar UF).",
    tieneConsolidado: true,
    consolidado: "Consolidación (Por tienda física y fecha de recepción).",
    tieneDescuento: true,
    descuento: "Descuento del 12% por tramo anual B2B.",
  },
};

function getCondicionesGenerales(rut: string, razonSocial: string): CondicionCliente {
  if (CUSTOM_CONDICIONES[rut]) {
    return CUSTOM_CONDICIONES[rut];
  }
  return {
    tieneCargaValorada: true,
    cargaValorada: "Aplica cobertura valorada 0.8% del valor declarado (Máx 500 UF).",
    tieneConsolidado: true,
    consolidado: "Consolidación (Por destino y fecha de entrega).",
    tieneDescuento: true,
    descuento: "Descuento del 10% según convenio comercial.",
  };
}

export const CLIENTES_STARKEN: ClienteReal[] = RAW_CLIENTES.map((item) => ({
  rut: item.rut,
  rutFormateado: formatRutChileno(item.rut),
  razonSocial: item.razonSocial,
  cuentasCorrientes: CUSTOM_ACCOUNTS[item.rut] || generateDefaultAccounts(item.rut, item.razonSocial),
  condicionesGenerales: getCondicionesGenerales(item.rut, item.razonSocial),
}));
