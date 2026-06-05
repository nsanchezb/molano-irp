import { useNavigate } from 'react-router-dom'
import styles from './PoliticaDatos.module.css'

export default function PoliticaDatos() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Volver
        </button>
      </div>

      <div className={styles.doc}>
        <h1 className={styles.h1}>Política de Tratamiento de Datos Personales</h1>
        <p className={styles.meta}>
          <strong>Índice de Reputación Pública — IRP</strong><br />
          Fecha de entrada en vigencia: <strong>4 de junio de 2026</strong><br />
          Última actualización: <strong>4 de junio de 2026</strong>
        </p>

        <h2 className={styles.h2}>1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de los datos personales recolectados, almacenados, usados, circulados, transmitidos, transferidos, analizados, comercializados o suprimidos en desarrollo del <strong>Índice de Reputación Pública — IRP</strong> es:</p>
        <div className={styles.infoBox}>
          <p><strong>Vencejo Consultores SAS</strong></p>
          <p>NIT: 902.069.284-4</p>
          <p>Correo electrónico: <a href="mailto:info@indicereputacionpublica.co">info@indicereputacionpublica.co</a></p>
          <p>Sitio web: <a href="https://www.indicereputacionpublica.co">www.indicereputacionpublica.co</a></p>
          <p>Domicilio: Park Place, Cajicá, Cundinamarca, Colombia</p>
        </div>
        <p>En adelante, el <strong>Responsable</strong>.</p>
        <p>El Índice de Reputación Pública — IRP es una iniciativa orientada a medir, analizar y divulgar percepciones, opiniones, experiencias y valoraciones de distintos grupos de interés frente a la gestión, reputación, confianza, integridad, desempeño institucional, liderazgo, innovación, transparencia, impacto social y valor público de entidades públicas del orden nacional, departamental, distrital o municipal.</p>

        <h2 className={styles.h2}>2. Alcance de la política</h2>
        <p>La presente Política aplica a todos los datos personales recolectados o tratados por el Responsable en el marco del IRP, incluyendo información obtenida mediante cuestionarios, encuestas, formularios físicos o digitales, entrevistas, bases de datos, registros de participación, comunicaciones electrónicas, canales web, redes sociales, eventos, alianzas, actividades académicas, investigativas, comerciales, consultivas, estadísticas, tecnológicas y de divulgación.</p>
        <p>Esta Política aplica a los datos de, entre otros:</p>
        <ol className={styles.ol}>
          <li>Ciudadanos, usuarios, beneficiarios o interesados en evaluar entidades públicas.</li>
          <li>Servidores públicos, empleados públicos, trabajadores oficiales, contratistas, colaboradores, excolaboradores o personas vinculadas directa o indirectamente con entidades públicas.</li>
          <li>Representantes de entidades, aliados, clientes, proveedores, patrocinadores, contratantes, financiadores, consultores, investigadores, académicos, periodistas, medios de comunicación y demás terceros relacionados con el IRP.</li>
          <li>Personas que se contacten con el Responsable por cualquier canal.</li>
          <li>Personas que participen voluntariamente en estudios, mediciones, investigaciones, pilotos, eventos, publicaciones, informes, rankings, análisis o productos derivados del IRP.</li>
        </ol>

        <h2 className={styles.h2}>3. Marco normativo</h2>
        <p>La presente Política se adopta en cumplimiento de la Constitución Política de Colombia, la Ley 1581 de 2012, el Decreto 1377 de 2013, el Decreto 886 de 2014, el Decreto Único Reglamentario 1074 de 2015, la Circular Única de la Superintendencia de Industria y Comercio, las circulares e instrucciones expedidas por la Superintendencia de Industria y Comercio en materia de protección de datos personales, transferencia internacional de datos personales y Registro Nacional de Bases de Datos, así como las demás normas que las modifiquen, adicionen, sustituyan o complementen.</p>

        <h2 className={styles.h2}>4. Definiciones</h2>
        <dl className={styles.dl}>
          <dt>Autorización</dt><dd>Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de sus datos personales.</dd>
          <dt>Base de datos</dt><dd>Conjunto organizado de datos personales que sea objeto de tratamiento.</dd>
          <dt>Dato personal</dt><dd>Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</dd>
          <dt>Dato público</dt><dd>Dato que no sea semiprivado, privado o sensible, incluyendo aquellos relativos al estado civil, profesión u oficio, calidad de comerciante o servidor público, y aquellos contenidos en registros públicos, documentos públicos, gacetas, boletines oficiales o sentencias judiciales debidamente ejecutoriadas que no estén sometidas a reserva.</dd>
          <dt>Dato sensible</dt><dd>Información que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación, tales como datos que revelen origen racial o étnico, orientación política, convicciones religiosas o filosóficas, pertenencia a sindicatos u organizaciones sociales o de derechos humanos, datos relativos a la salud, vida sexual y datos biométricos.</dd>
          <dt>Encargado del tratamiento</dt><dd>Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros realice tratamiento de datos personales por cuenta del Responsable.</dd>
          <dt>Responsable del tratamiento</dt><dd>Persona natural o jurídica, pública o privada, que decide sobre la base de datos o el tratamiento de los datos personales.</dd>
          <dt>Titular</dt><dd>Persona natural cuyos datos personales sean objeto de tratamiento.</dd>
          <dt>Tratamiento</dt><dd>Cualquier operación sobre datos personales, tales como recolección, almacenamiento, uso, circulación, análisis, procesamiento, supresión, transmisión, transferencia, actualización, organización, estructuración, conservación, consulta, reproducción, anonimización, seudonimización, comercialización, cesión o disposición.</dd>
          <dt>Transferencia</dt><dd>Envío de datos personales a un receptor que, a su vez, actúa como responsable del tratamiento, dentro o fuera de Colombia.</dd>
          <dt>Transmisión</dt><dd>Comunicación de datos personales a un encargado, dentro o fuera de Colombia, para que realice tratamiento por cuenta del Responsable.</dd>
        </dl>

        <h2 className={styles.h2}>5. Principios para el tratamiento de datos personales</h2>
        <p>El Responsable tratará los datos personales conforme a los siguientes principios:</p>
        <ol className={styles.ol}>
          <li><strong>Legalidad:</strong> el tratamiento se realizará conforme a la ley aplicable.</li>
          <li><strong>Finalidad:</strong> el tratamiento obedecerá a finalidades legítimas, informadas y autorizadas por el titular cuando sea necesario.</li>
          <li><strong>Libertad:</strong> el tratamiento solo se realizará con autorización previa, expresa e informada del titular, salvo las excepciones legales.</li>
          <li><strong>Veracidad o calidad:</strong> la información deberá ser veraz, completa, exacta, actualizada, comprobable y comprensible.</li>
          <li><strong>Transparencia:</strong> el titular podrá obtener información sobre la existencia de datos que le conciernan.</li>
          <li><strong>Acceso y circulación restringida:</strong> el tratamiento se sujetará a los límites derivados de la naturaleza de los datos y la autorización otorgada.</li>
          <li><strong>Seguridad:</strong> se adoptarán medidas técnicas, humanas, administrativas y organizacionales razonables para proteger los datos personales.</li>
          <li><strong>Confidencialidad:</strong> las personas que intervengan en el tratamiento estarán obligadas a garantizar la reserva de la información.</li>
          <li><strong>Responsabilidad demostrada:</strong> el Responsable procurará mantener evidencia de las medidas adoptadas para cumplir el régimen de protección de datos personales.</li>
        </ol>

        <h2 className={styles.h2}>6. Datos personales que podrán ser recolectados</h2>
        <p>En desarrollo del IRP, el Responsable podrá recolectar y tratar, entre otros, los siguientes datos:</p>
        <ol className={styles.ol}>
          <li><strong>Datos de identificación:</strong> nombres, apellidos, tipo y número de documento, firma, usuario, identificadores digitales.</li>
          <li><strong>Datos de contacto:</strong> correo electrónico, teléfono, ciudad, municipio, departamento, país, dirección, redes sociales o canales de comunicación.</li>
          <li><strong>Datos sociodemográficos:</strong> edad o rango de edad, género, nivel educativo, ocupación, sector de actividad, ubicación territorial.</li>
          <li><strong>Datos laborales o de vinculación institucional:</strong> entidad evaluada, tipo de vinculación, rol, cargo, área, nivel jerárquico, modalidad de contratación.</li>
          <li><strong>Datos de opinión, percepción y experiencia:</strong> respuestas a cuestionarios, calificaciones, comentarios, valoraciones, percepciones, opiniones, relatos, experiencias.</li>
          <li><strong>Datos de navegación y uso tecnológico:</strong> dirección IP, identificadores de dispositivo, cookies, fecha y hora de acceso, navegador, sistema operativo.</li>
          <li><strong>Datos derivados o inferidos:</strong> perfiles estadísticos, segmentos, patrones de respuesta, indicadores, puntuaciones, clasificaciones, índices agregados.</li>
          <li><strong>Datos contractuales, comerciales o administrativos:</strong> información de aliados, clientes, proveedores, contratantes, patrocinadores, financiadores.</li>
          <li><strong>Datos públicos:</strong> información obtenida de fuentes públicas, registros públicos, portales institucionales, sitios web oficiales, medios de comunicación.</li>
        </ol>

        <h2 className={styles.h2}>7. Tratamiento de datos sensibles</h2>
        <p>El titular no está obligado a autorizar el tratamiento de datos sensibles. En caso de que algún cuestionario, formulario, respuesta abierta, entrevista o comunicación incluya datos sensibles, el Responsable podrá tratarlos únicamente cuando exista autorización explícita, necesidad de salvaguardar el interés vital del titular, necesidad para el reconocimiento de un derecho en proceso judicial, o finalidad histórica, estadística, científica o académica con medidas de anonimización.</p>

        <h2 className={styles.h2}>8. Tratamiento de datos de niños, niñas y adolescentes</h2>
        <p>El IRP no está dirigido a niños, niñas o adolescentes. El Responsable evitará recolectar datos de menores de edad salvo que sea estrictamente necesario, respete su interés superior y cuente con la autorización de sus representantes legales.</p>

        <h2 className={styles.h2}>9. Finalidades del tratamiento</h2>

        <h3 className={styles.h3}>9.1. Finalidades principales del IRP</h3>
        <ol className={styles.ol}>
          <li>Diseñar, aplicar, gestionar y mejorar cuestionarios, encuestas, instrumentos, metodologías, modelos, indicadores y métricas del IRP.</li>
          <li>Medir, analizar, comparar y evaluar la reputación, percepción, confianza, integridad, desempeño, transparencia, liderazgo, innovación, impacto social y gestión de entidades públicas.</li>
          <li>Construir, calcular, actualizar y publicar índices, rankings, mediciones, estudios, reportes, tableros, análisis, diagnósticos e investigaciones.</li>
          <li>Realizar análisis estadístico, descriptivo, predictivo, comparativo, longitudinal, territorial, sectorial, institucional y reputacional.</li>
          <li>Verificar la calidad, consistencia, autenticidad e integridad de las respuestas; prevenir duplicidades, fraudes, manipulaciones, sesgos o usos indebidos del instrumento.</li>
          <li>Administrar la participación de titulares en encuestas, mediciones, investigaciones, eventos, convocatorias, grupos focales, entrevistas o validaciones metodológicas.</li>
        </ol>

        <h3 className={styles.h3}>9.2. Finalidades de investigación, analítica y conocimiento</h3>
        <ol className={styles.ol}>
          <li>Desarrollar investigaciones académicas, sociales, científicas, estadísticas, periodísticas, consultivas, técnicas o de interés público sobre reputación, gestión pública, confianza, gobernanza y transparencia.</li>
          <li>Crear, enriquecer, depurar, actualizar, anonimizar, agregar, clasificar, consolidar, modelar y analizar bases de datos para fines estadísticos, científicos, comerciales, investigativos o estratégicos.</li>
          <li>Elaborar publicaciones, artículos, libros, presentaciones, documentos técnicos, informes, estudios comparados, metodologías, material pedagógico e infografías.</li>
          <li>Entrenar, probar, calibrar y mejorar herramientas tecnológicas, modelos estadísticos, sistemas de analítica, visualización, automatización y procesamiento de información.</li>
        </ol>

        <h3 className={styles.h3}>9.3. Finalidades comerciales, estratégicas y de aliados</h3>
        <ol className={styles.ol}>
          <li>Diseñar, ofrecer, comercializar, licenciar o poner a disposición productos, servicios, informes, estudios, reportes, bases de datos, tableros, indicadores, rankings, análisis, consultorías y herramientas tecnológicas.</li>
          <li>Compartir, transmitir, transferir, ceder, licenciar o comercializar datos, análisis, indicadores, resultados o productos derivados con aliados estratégicos, clientes, patrocinadores, financiadores, entidades públicas y terceros interesados, de conformidad con la autorización otorgada y la ley.</li>
          <li>Gestionar relaciones comerciales, contractuales, publicitarias, editoriales, académicas, institucionales, tecnológicas y de cooperación con terceros.</li>
          <li>Enviar comunicaciones comerciales, informativas, académicas, promocionales, editoriales o institucionales sobre el IRP, sus resultados, productos, servicios, eventos, publicaciones y alianzas.</li>
          <li>Realizar campañas de mercadeo, prospección, relacionamiento, fidelización, segmentación, publicidad, posicionamiento y divulgación.</li>
        </ol>

        <h3 className={styles.h3}>9.4. Finalidades administrativas, legales y de seguridad</h3>
        <ol className={styles.ol}>
          <li>Atender consultas, solicitudes, reclamos, peticiones, quejas y requerimientos de titulares, autoridades o terceros legitimados.</li>
          <li>Gestionar autorizaciones, consentimientos, evidencias, trazabilidad, preferencias, supresiones y revocatorias.</li>
          <li>Cumplir obligaciones legales, contractuales, contables, fiscales, tributarias, administrativas, regulatorias, judiciales o de reporte ante autoridades.</li>
          <li>Prevenir, detectar, investigar o gestionar incidentes de seguridad, accesos no autorizados, fraude, suplantación, manipulación de encuestas o ataques informáticos.</li>
          <li>Administrar sistemas de información, plataformas tecnológicas, sitios web, formularios, herramientas de encuesta, bases de datos, repositorios, copias de seguridad e infraestructura.</li>
          <li>Ejercer la defensa judicial o administrativa del Responsable y proteger sus derechos, intereses, activos, metodologías y propiedad intelectual.</li>
        </ol>

        <h2 className={styles.h2}>10. Autorización del titular</h2>
        <p>El tratamiento de datos personales se realizará con autorización previa, expresa e informada del titular, salvo los casos exceptuados por la ley. La autorización podrá obtenerse por medios físicos, electrónicos, digitales, telefónicos, formularios web, casillas de aceptación, mensajes de datos, grabaciones u otros medios que permitan su consulta posterior.</p>
        <p>Al participar en cuestionarios, encuestas, formularios o actividades del IRP, el titular declara que la información suministrada es veraz, que ha sido informado sobre esta Política y que autoriza el tratamiento de sus datos personales conforme a las finalidades aquí descritas.</p>

        <h2 className={styles.h2}>11. Carácter facultativo de las respuestas</h2>
        <p>La participación en el IRP es voluntaria. El titular podrá abstenerse de responder preguntas que considere sensibles, innecesarias o que no desee contestar. El suministro de datos sensibles será siempre facultativo.</p>

        <h2 className={styles.h2}>12. Circulación, cesión, transferencia o comercialización de datos</h2>
        <p>El titular autoriza que sus datos personales puedan ser compartidos, transmitidos, transferidos, cedidos, licenciados, comercializados o vendidos, de forma gratuita u onerosa, a terceros ubicados en Colombia o en el exterior, incluyendo aliados estratégicos, clientes, entidades públicas, empresas privadas, universidades, centros de investigación, organismos de cooperación, medios de comunicación, proveedores tecnológicos, consultores, contratistas, patrocinadores, financiadores, plataformas de analítica, empresas de nube, operadores de encuestas, agencias de comunicación, firmas de estudios de mercado y demás terceros relacionados con el desarrollo, financiación, operación, análisis, explotación, mejora, expansión, publicación, comercialización o sostenibilidad del IRP.</p>
        <p>El Responsable procurará que los terceros que reciban datos personales asuman obligaciones de confidencialidad, seguridad, uso limitado y cumplimiento normativo.</p>

        <h2 className={styles.h2}>13. Transferencia y transmisión internacional de datos personales</h2>
        <p>El titular autoriza la transferencia y transmisión nacional e internacional de sus datos personales cuando ello sea necesario o conveniente para el desarrollo de las finalidades previstas en esta Política, incluyendo el uso de servicios tecnológicos, almacenamiento en la nube, plataformas de encuestas, analítica, inteligencia artificial, visualización, CRM, correo electrónico, hosting, seguridad, respaldo, soporte, consultoría, investigación, alianzas, comercialización y expansión internacional del IRP.</p>

        <h2 className={styles.h2}>14. Publicación de resultados</h2>
        <p>El IRP podrá publicar resultados generales, agregados, estadísticos, anonimizados o seudonimizados sobre entidades, sectores, territorios, dimensiones, atributos, grupos de interés, tendencias o hallazgos a través de sitios web, redes sociales, medios de comunicación, informes comerciales, estudios privados, tableros, plataformas, boletines, rankings, productos editoriales o entregables para aliados y terceros autorizados.</p>

        <h2 className={styles.h2}>15. Derechos de los titulares</h2>
        <p>Los titulares tienen derecho a:</p>
        <ol className={styles.ol}>
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informados, previa solicitud, sobre el uso dado a sus datos personales.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones al régimen de protección de datos personales.</li>
          <li>Revocar la autorización o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías legales.</li>
          <li>Acceder gratuitamente a sus datos personales que hayan sido objeto de tratamiento.</li>
          <li>Abstenerse de responder preguntas sobre datos sensibles o de menores de edad.</li>
        </ol>

        <h2 className={styles.h2}>16. Procedimiento para consultas y reclamos</h2>
        <p>El titular podrá ejercer sus derechos enviando una solicitud a:</p>
        <div className={styles.infoBox}>
          <p><strong>info@indicereputacionpublica.co</strong></p>
        </div>
        <p>La solicitud deberá contener: nombre e identificación del titular, descripción clara de la consulta o derecho que desea ejercer, datos de contacto y documentos que acrediten la calidad en que actúa.</p>
        <p><strong>Consultas:</strong> atendidas en máximo diez (10) días hábiles.</p>
        <p><strong>Reclamos:</strong> atendidos en máximo quince (15) días hábiles desde el recibo completo.</p>

        <h2 className={styles.h2}>17. Deberes del Responsable</h2>
        <p>El Responsable se compromete a garantizar el pleno ejercicio del derecho de habeas data; solicitar y conservar copia de la autorización; informar debidamente al titular sobre las finalidades y sus derechos; conservar la información bajo condiciones de seguridad razonables; actualizar, rectificar o suprimir los datos cuando sea procedente; tramitar consultas y reclamos en los términos legales; y cumplir las instrucciones de la Superintendencia de Industria y Comercio.</p>

        <h2 className={styles.h2}>18. Seguridad de la información</h2>
        <p>El Responsable adoptará medidas técnicas, administrativas, humanas y organizacionales razonables para proteger los datos personales frente a pérdida, acceso no autorizado, uso indebido, alteración, divulgación, destrucción, fraude o tratamiento no autorizado, incluyendo controles de acceso, autenticación, copias de seguridad, cifrado, acuerdos de confidencialidad, capacitación, gestión de proveedores y protocolos de respuesta a incidentes.</p>

        <h2 className={styles.h2}>19. Conservación de la información</h2>
        <p>Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades autorizadas, atender obligaciones legales, contractuales, administrativas, contables, fiscales, probatorias, históricas, estadísticas, científicas, comerciales, investigativas o de defensa jurídica. Los datos anonimizados, agregados, estadísticos e indicadores que no permitan identificar razonablemente a una persona natural podrán conservarse y utilizarse de manera indefinida.</p>

        <h2 className={styles.h2}>20. Uso de cookies y tecnologías similares</h2>
        <p>El sitio web, formularios o plataformas del IRP podrán utilizar cookies, píxeles, etiquetas, identificadores, herramientas de analítica, medición, seguridad, personalización o tecnologías similares. El titular podrá configurar su navegador para bloquear o eliminar cookies, aunque algunas funcionalidades podrían verse afectadas.</p>

        <h2 className={styles.h2}>21. Modificaciones de la Política</h2>
        <p>El Responsable podrá modificar esta Política en cualquier momento. Las modificaciones serán publicadas en el sitio web o informadas por los medios que el Responsable considere adecuados. Cuando los cambios impliquen nuevas finalidades que requieran autorización, el Responsable solicitará una nueva autorización al titular.</p>

        <h2 className={styles.h2}>22. Vigencia</h2>
        <p>La presente Política rige a partir del <strong>4 de junio de 2026</strong>. Las bases de datos sujetas al tratamiento descrito estarán vigentes durante el tiempo necesario para cumplir las finalidades del IRP y las obligaciones legales, contractuales, comerciales, estadísticas, investigativas, históricas, probatorias y de defensa jurídica del Responsable.</p>

        <h2 className={styles.h2}>23. Contacto</h2>
        <div className={styles.infoBox}>
          <p>Para consultas, reclamos, solicitudes, revocatorias, actualizaciones, supresiones o ejercicio de derechos relacionados con datos personales:</p>
          <p><a href="mailto:info@indicereputacionpublica.co"><strong>info@indicereputacionpublica.co</strong></a></p>
        </div>
      </div>
    </div>
  )
}
