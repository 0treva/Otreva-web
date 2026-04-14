// ==========================================
// H4CK3R BL0G - Main Application Logic
// ==========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadLanguage();
    loadBlogPosts();
    setupAuthorFilter();
    setupHiddenLoginAccess();
    setupLanguageToggle();
    setupThemeToggle();
    loadTheme();
});

// Current language
let currentLang = 'en';

// Translations
const translations = {
    en: {
        home: 'HOME',
        filterAuthor: 'FILTER BY AUTHOR:',
        allPosts: 'ALL POSTS',
        anonymous: 'ANONYMOUS',
        otreva: 'OTREVA',
        spiegel: 'SPIEGEL',
        status: 'STATUS:',
        online: 'ONLINE',
        users: 'USERS:',
        posts: 'POSTS:',
        noPosts: 'No posts available yet. Be the first to write something!',
        postedBy: 'by',
        on: 'on'
    },
    es: {
        home: 'INICIO',
        filterAuthor: 'Ver:',
        allPosts: 'Todos',
        anonymous: 'Anónimo',
        otreva: 'Otreva',
        spiegel: 'Spiegel',
        status: 'ESTADO:',
        online: 'EN LÍNEA',
        users: 'USUARIOS:',
        posts: 'POSTS:',
        noPosts: 'No hay posts disponibles aún. ¡Sé el primero en escribir algo!',
        postedBy: 'por',
        on: 'el'
    }
};

// === Matrix Background Effect ===
function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(draw, 33);

    // Resize handler
    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// === Clock Update ===
function updateClock() {
    const clockElement = document.getElementById('current-time');
    if (!clockElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clockElement.textContent = timeString;
}

// === Initial Blog Data (Fallback for local file:// protocol) ===
const initialBlogData = [
    {
        "id": 1,
        "title": "Welcome to the Underground",
        "author": "anonymous",
        "date": "2019-01-15T08:00:00Z",
        "content": "The internet is not just a network of computers. It's a battlefield of information, where knowledge is power and anonymity is freedom. This blog will serve as a chronicle of our journey through the digital realm.\n\nWe are the watchers in the shadows, the guardians of digital liberty. Our mission: to expose the truth, share knowledge, and push the boundaries of what's possible.\n\nStay alert. Stay curious. Stay anonymous.",
        "tags": [
            "announcement",
            "manifesto",
            "freedom"
        ]
    },
    {
        "id": 2,
        "title": "Breaking Down Modern Encryption",
        "author": "spiegel",
        "date": "2019-03-20T14:30:00Z",
        "content": "In today's digital age, encryption is more than just a tool—it's a necessity. Let me break down some fundamental concepts:\n\nSymmetric vs Asymmetric: The eternal debate. Symmetric encryption uses the same key for encryption and decryption. Fast, but key distribution is a nightmare. Asymmetric uses key pairs—public and private. Slower, but elegant.\n\nThe real power comes from combining both. Use asymmetric to exchange a symmetric key, then encrypt bulk data with the symmetric algorithm. This is how TLS works, people.\n\nRemember: The algorithm may be public, but your keys are sacred. Guard them with your life.",
        "tags": [
            "security",
            "encryption",
            "tutorial"
        ]
    },
    {
        "id": 3,
        "title": "My Journey into Reverse Engineering",
        "author": "otreva",
        "date": "2019-07-10T09:15:00Z",
        "content": "Reverse engineering is like digital archaeology. You're taking apart someone else's creation to understand how it works, why it works, and sometimes... how to make it work differently.\n\nStarted with simple programs, disassembling them byte by byte. The x86 assembly looked like hieroglyphics at first. But patterns emerge. You start to see the compiler's fingerprints, the programmer's habits.\n\nTools I cant live without: IDA Pro for static analysis, OllyDbg for dynamic debugging, and a LOT of coffee.\n\nThe best feeling? When you finally understand that one function that's been bugging you for days. It's like solving a puzzle nobody asked you to solve.",
        "tags": [
            "reverse-engineering",
            "assembly",
            "tools"
        ]
    },
    {
        "id": 4,
        "title": "The Art of Social Engineering",
        "author": "anonymous",
        "date": "2019-10-05T18:45:00Z",
        "content": "The weakest link in any system isn't the technology—it's the human using it.\n\nSocial engineering is psychological manipulation at its finest. You're not hacking computers; you're hacking minds. Want access to a secure system? Don't brute-force the password. Call the help desk, pretend to be from IT, and ask them to reset it for you.\n\nKey principles:\n1. Build trust quickly\n2. Create urgency\n3. Use authority\n4. Never give them time to think\n\nBut remember: with great power comes great responsibility. Use this knowledge ethically. The goal is to understand vulnerabilities, not exploit people.",
        "tags": [
            "social-engineering",
            "psychology",
            "security"
        ]
    },
    {
        "id": 5,
        "title": "Network Protocols: A Deep Dive",
        "author": "spiegel",
        "date": "2020-02-14T12:20:00Z",
        "content": "Let's talk about the backbone of the internet: protocols.\n\nTCP/IP is the foundation. TCP ensures reliable delivery—every packet acknowledged. IP handles routing. Together, they make the internet work.\n\nBut the interesting stuff happens at higher layers. HTTP is glorified text over TCP. DNS translates names to IPs—a distributed database vulnerable to poisoning. SMTP for email? Totally insecure without extensions.\n\nWant to really understand networks? Fire up Wireshark and watch the traffic. See those packets? Each one tells a story. HTTP headers leak information. DNS queries reveal browsing habits. TCP handshakes show connection patterns.\n\nKnowledge is intercepted packets properly analyzed.",
        "tags": [
            "networking",
            "protocols",
            "analysis"
        ]
    },
    {
        "id": 6,
        "title": "Building Secure Systems",
        "author": "otreva",
        "date": "2020-05-28T23:59:00Z",
        "content": "As we close out the year, let's talk about building things the right way.\n\nSecurity isn't a feature you add at the end. It's a mindset you adopt from day one.\n\nPrinciples I live by:\n- Defense in depth: Multiple layers of security\n- Least privilege: Give minimum necessary access\n- Fail securely: When something breaks, it should lock down, not open up\n- Never trust user input: EVER\n\nThe Y2K bug taught us that shortcuts come back to haunt you. Write code like someone malicious will read it. Because they will.\n\nHere's to a new millennium of secure, robust systems. May your code be clean and your exploits be patched.",
        "tags": [
            "security",
            "best-practices",
            "development"
        ]
    },
    {
        "id": 7,
        "title": "Felicidad ¿Realidad o ficción?",
        "author": "spiegel",
        "date": "2022-10-08T17:04:28Z",
        "content": "No hay quien no quiera , ¡oh hermano Galión!, vivir felizmente, pero para ver qué es lo que hace la vida feliz, todos andan ciegos; por eso no es nada fácil conseguir una vida bienaventurada hasta el punto de que tanto más se separa de ella quien con más vehemencia la busca, si se equivoca de camino, pues si va por el contrario, la misma velocidad es causa de un mayor distanciamiento. Cicerón. De la vida bienaventurada. La felicidad está en uno mismo. Pero ¿Por qué digo esto? Esto se debe a múltiples razones, una de las cuales es que la felicidad no es una estación de llegada si no una forma de viajar. Esto podría sonar como alguna frase motivacional que hay en la parte de atrás de un calendario, pero implica muchas más cosas, tales como que la felicidad no es un estado permanente, esto lo podemos comprobar checando nuestro estado de animo a lo largo del día, nos resultara imposible permanecer eufóricos todo el día ya que podremos identificar en nosotros muchas más emociones (claro asumiendo que puedas nombrarlas, en caso de no ser así simplemente las reconocerás como esto de no-felicidad). Conforme a esto podríamos afirmar que el destino nos encierra, que simplemente no es posible ser feliz, que la felicidad no está dentro de nosotros. Cuando todo el mundo va en tu contra, cuando te pasan todas las desgracias que te podrían pasar o simplemente un mal día ¿Cómo podrías ser feliz en estas situaciones sólo contigo mismo, si se supone que la felicidad está en ti? Con esto sería lógico pensar que la felicidad es algo circunstancial, que esta fuera de nuestro alcance. La felicidad no es un estado sencillo de alcanzar, si no que por el contrario podría parecer que entre más se busca más lejos de nosotros parece estar, como un niño caprichoso que se acerca a ti solamente cuando lo desea y cuando tu lo buscas corre de ti, se aleja. No se puede definir lo que es la felicidad de una forma sencilla ya que es algo sumamente complejo de entender en palabras, sería ridículo pensar en hablar de algo que es sumamente complejo de definir, pero es algo que todos entendemos. Aunque el concepto tiende a variar de persona a persona, esto debido a lo variados que somos, mismo que podemos confirmar simplemente al momento de hablar con una persona y compartir vivencias. En lo que podemos estar todos de acuerdo es que todas las personas buscamos tener una vida feliz, es uno de nuestros principales motores al momento de hacer las cosas, siempre buscamos estar lo más cercano a feliz y lo más alejados de la infelicidad (no-feliz). Sería lógico pensar que la felicidad es la ignorancia, que eras feliz antes de tener el conocimiento que te volvió infeliz, aquella cosa que una vez sabes ya no te permite volver a ser la misma feliz persona, podrías con esto afirmar “Si la ignorancia es dicha, entonces quiero ser dichosamente ignorante”, en este sentido tampoco la felicidad estaría dentro de ti, si no estaría directamente relacionada con la cantidad de información que recibes del mundo exterior. La razón por la que yo afirmo que la felicidad está dentro de ti es que a pesar de todo lo que haya en el mundo, cómo te esté tratando la vida, todo lo que te quiten, lo único que no te pueden quitar es a ti mismo, a pesar de los estímulos externos que puede haber, al final siempre estas tu y está el como tu reaccionas a estos estímulos, no se trata de ser feliz todo el tiempo, se trata sencillamente de ser feliz. Tú propiamente eres la razón misma de tu felicidad, no esta fuera de ti, tu felicidad no la sientes desde una parte que no seas tú, si no que sencillamente la sientes dentro de ti, aunque sientas felicidad por otra persona donde sientes la felicidad es en ti, en tu interior, nosotros podemos pensar que estas feliz, pero el único que lo puede saber con seguridad eres tú mismo, es por la misma naturaleza que esta dentro de ti y otra persona no puede con seguridad saber lo que hay en tu interior. Así que sencillamente la felicidad en este sentido sería el como tu mismo percibes al mundo y el como reaccionas a esos estímulos",
        "content_type": "html",
        "cover": null,
        "tags": [
            "pensar",
            "felicidad",
            "filosofia"
        ]
    },
    {
        "id": 8,
        "title": "Belleza",
        "author": "spiegel",
        "date": "2022-10-05T01:28:42Z",
        "content": "Nacimos por la naturaleza, estamos en la naturaleza, sería difícil negar la parte natural que nos encierra, que nos deja lugar a tantas interrogantes. Grosso Modo nosotros vemos cosas que nos parecen bellas, hermosas, sublimes y podemos llegar a cuestionar a las personas a nuestro al rededor, sobre nuestro objeto de admiración. Algunas compartirán el gusto, otras tantas les será indiferente. Sería natural indagar y cuestionarnos sobre lo que nos parece hermoso, sería más fácil pensar que la belleza es relativa, pero ¿relativa a qué? ¿Será acaso por nuestras vivencias personales? O ¿será por la sociedad en la que vivimos ¿Será directamente relacionado con nuestros deseos o nuestras ambiciones? Nos sería especialmente complicado respondernos a estas y a más preguntas ya que es una cuestión más personal. Lo que podemos decir es que sea cual sea la razón de nuestro sentido de belleza esta limitada, sesgada y no es libre esto porque tenemos juicios y la parte que considero que es nuestra parte más humana y libre de cada uno de nosotros, estamos sujetos a lo que conocemos, el vocabulario que tenemos, lo que leemos, con quienes nos desarrollamos, la educación que recibimos y toda esta serie de factores que nos limitan, que nos atan de una u otra manera. “El sexo sin amor no es más que una complicada forma de masturbación” Martínez R. Si en este sentido juzgamos a lo que nos parece bello por la razón de como nos hace sentir esto nos limitaría aún más, además que esto también depende de nuestro amor, muchas veces no valoramos las cosas solo por el hecho de que son cosas, si no que por lo que me pueden aportar a mi a manera de individuo. También tenemos que considerar que todo grado de pacer que tenemos tiene una cierta consecuencia, en este caso sexual sería prudente mencionar lo que es una “Petite mortt” después de que te das cuenta de todo lo que te había costado para llegar a ese momento después del orgasmo en el que dejas de tener una satisfacción real. Por esto no es tan descabellado decir que mueres sin morir solo por dejarte vender a tus deseos y a esta parte tan humana, para quedar totalmente vació. Finalmente por todas estas cuestiones se exige un pensamiento crítico, autoconocimiento, reflexión, tiempo con uno mismo para que en este sentido podamos llegar a tocar lo que es metafóricamente mencionado como tierra firme y vivir mejor.",
        "content_type": "html",
        "cover": "https://cdn-images-1.medium.com/max/913/1*LR-WTtY3IEtyqEQMXWimVw.png",
        "tags": [
            "filosofia",
            "belleza",
            "pensamiento-crítico",
            "autoconhecimento"
        ]
    },
    {
        "id": 9,
        "title": "Democracia",
        "author": "spiegel",
        "date": "2022-04-02T15:25:05Z",
        "content": "A continuación, se hablará de lo que es la democracia, su importancia y lo que se puede hacer como agente de democracia en nuestras comunidades y la importancia de nuestra participación en temas de interés social. Siendo la democracia conocida como el “el poder del pueblo” nos puede hacer pensar el cómo se lleva a cabo este poder. Según como es bien conocido en nuestra sociedad se ejerce a partir del voto. En la sociedad mexicana el voto es libre y secreto; es mediante el voto que se eligen a los representantes que van a ser por el próximo periodo, al mismo tiempo estos representantes pueden hacer todo lo que consideren en beneficio del pueblo (aunque no siempre sea así), y parece que para muchas y muchos ciudadanos esto termina ahí, simplemente votan y con eso ya acabo su responsabilidad ciudadana por el periodo de tiempo que este dure. Por otra parte, también es conocida como una pirámide. Esto se debe al hecho de que para que sea sostenible la parte de la política como se conoce actualmente en nuestra región, es necesario que se mantengan todos los proyectos que se realicen desde lo más alto de la pirámide (representa al ejecutivo) hasta lo más bajo de la misma (representa al pueblo), siendo esta última la que paga y la que tiene el cargo para al final proveer al estado para que se haga. Para poder definir de una manera más clara lo que realmente representa la democracia tomemos la definición de Bryce: “Un Etos, condición que permite a los integrantes de una sociedad vincularse bajo el principio de igualdad” en este aspecto esta sumamente marcado el hecho de que todos son iguales y al momento de ejercer un cargo político no tienes beneficios claros si no que por el contrario como propiamente el nombre lo dice tienes que llevar el cargo de la sociedad de la cual fuiste electo. Otro punto de vista de un gran pensador como Dahl es: “La soberanía descansa en la propia nación y en su sistema legislativo; integra el debate en las contiendas electorales y la participación de la ciudadanía en la discusión y construcción de principios políticos útiles para el actuar del gobierno” esto marca un gran precedente que es verdaderamente útil tenerlo en consideración. Finalmente, la democracia es parte de la responsabilidad como ciudadano y es necesaria para dar a entender todas las problemáticas que se dan en tu comunidad, no tienes que quedarte callado al momento de que se ve una injusticia y es fundamental para tener una vida digna. Como un agente de democracia es necesaria tu voz, ya sea en forma de manifestaciones, mandarle correo electrónico al encargado de tu comunidad y al final hacer denotar tu voz para que se tome en cuenta en las decisiones que son de suma importancia para todas y todos.",
        "content_type": "html",
        "cover": null,
        "tags": []
    },
    {
        "id": 10,
        "title": "Momento presente",
        "author": "spiegel",
        "date": "2022-01-17T17:06:44Z",
        "content": "Momento presente “Tú no estás donde quieres estar, tú sientes que deberías estar en otro lugar, si pudieras tronar los dedos y aparecer en dónde quisieras estar apuesto a que te sentirías igual, en el lugar equivocado el punto es que te enfocas tanto en dónde quisieras estar que olvidas cómo sacar provecho del lugar en el que estas.” Película pasajeros Esta frase es realmente interesante ya que realmente nos pone a pensar en lo que nos pasa en este momento tan cambiante que es para nosotros la adolescencia (los que seguimos en ella), además que en lo personal me puedo sentir identificado ya que se puede estar físicamente en un lugar, pero al mismo tiempo tener la mente en un lugar tan distante que no deja espacio al disfrute del momento presente. Las personas somos seres sumamente cambiantes, algunos más que otros y siendo una persona tan cambiante muchas veces desearías estar en un lugar en el que no lo estas, pero al momento de escuchar esta frase te hace cuestionar el porque no disfrutas estar en el momento presente, además de las carencias que se tienen, exhortó a la reflexión de que es lo que te falta para ser feliz ya que realmente muchas veces son cosas superfluas que tienen mucho que ver con traumas de la infancia. Tenemos que aprender a vivir con lo que tenemos ya que es algo que nos hace ser unas personas más felices y unas personas más agradecidas. Realmente la vida se disfruta más cuando eres una persona agradecida, por eso, aprender a disfrutar el momento en el que estás es sumamente importante para ser un ser más pleno y al mismo tiempo tener una mejor calidad de vida.",
        "content_type": "html",
        "cover": null,
        "tags": [
            "pensar",
            "películas",
            "pensamientos"
        ]
    },
    {
        "id": 11,
        "title": "Crecer",
        "author": "spiegel",
        "date": "2021-12-04T01:38:23Z",
        "content": "Extraño ese momento donde no había preocupaciones, aquel momento de antaño, donde la mayor cavilación que teníamos era el hecho de nuestro deseo innato de ser como aquellos superhéroes que eran para nosotros nuestros padres, o nuestro superhéroe o personaje de ficción favorito. Dónde no era más importante ser el mejor, ni quedar bien ante un grupo de personas, que cuando ibas a fiestas podrías empezar a bailar antes que todos y no te importaría el qué dirán, sino solo pasarla bien. Ay de mi pesar que nos confiere el crecer, nos acerca más a lo que en algún momento pensamos fueron para nosotros nuestros padres que parece tan fácil estando en cabeza infante, pero que tienes que dar tanto de ti para poder lograrlo. Sabes que creciste cuando comprendes el porqué de la frustración de tus progenitores, cuando empiezas a vislumbrar que no todo va a ser fácil, que la vida no es lo que veíamos en películas. Pero realmente, ¿en qué momento dejamos lo que queríamos hacer para después diciéndonos un discurso mental que no era más que una autojustificación para no hacerlo? Donde se nos hizo más fácil solo centrarnos en lo que se supone que tenemos que hacer y para nada en lo que queremos hacer. Crecer no está mal, es parte del ciclo natural de las cosas y nos hace ser nosotros. El mundo que imaginamos de niños no existe, esto nos podría llevar a muchas decepciones ya que nos podemos enfrascar en todo lo negativo que trae consigo crecer, pero dándole un nuevo enfoque siendo mayores podemos y tenemos un compromiso moral con tu yo niño de crear un mundo mejor para que las próximas generaciones tengan lo que nosotros no, un mundo mejor, que aunque roto, puede ser curado. Ya que realmente “muchas personas en muchos lugares pequeños, haciendo cosas pequeñas pueden cambiar el mundo.”",
        "content_type": "html",
        "cover": "https://cdn-images-1.medium.com/max/287/1*M_AMePH-j7RAO0-f09v7QQ.jpeg",
        "tags": [
            "superación-personal",
            "español",
            "crecer",
            "saber",
            "crecimiento-personal"
        ]
    },
    {
        "id": 12,
        "title": "El principito, análisis libro y película",
        "author": "spiegel",
        "date": "2021-10-17T16:52:54Z",
        "content": "El Principito es un libro escrito en 1943 por el autor Antoine de Saint-Exupéry. Es considerado como uno de los libros clásicos y más importantes en la literatura infantil, cuenta con 129 páginas, con un tiempo de lectura medio de 1 hora y 28 min (según Kindle). Por otro lado la película cuenta con 110 minutos, estrenada en el año 2015 con la productora: Orange Studio En mi opinión personal, el libro es mucho mejor que la película. Realmente no se alcanzan a abarcar todos los temas del libro en la película, sino que ésta trata de ser más una “secuela” o una “historia paralela” a lo que pasó en el libro. No se termina de entender la película si antes no leiste el libro y hasta llega a cambiar el tema principal del mismo que es la amistad, por un tema que no se termina de entender a lo largo de toda la película, ya que ésta se siente muy apresurada, no termina de tocar bien todos los temas del libro y no conformes con eso, agregaron una historia adicional que no hace más que bajar la calidad de la película, además que la adaptación músical es terrible para un película infantil, esto debido a que se llega a sentir aburrida. Por otro lado el tipo de lectura que se tiene en el libro, se siente como una lectura realmente ligera y entretenida a la vez, notas una verdadera crítica a la sociedad, se lee con cada palabra, con los diferentes temas que se ven y la manera tan “infantil” en la que se toman entendibles no solo para un niño (el público objetivo del libro) sino también para “el niño interior que todos llevamos dentro” dándonos a entender con personajes tan memorables aprendizajes de vida como lo son: -La importancia del trabajo y la dedicación, mismo que se puede ver en el asteroide del Principito cuando se narra el trabajo que tiene que hacer en el momento, además de la importancia que se tiene a estar prevenidos porque como menciona el Principito “Nunca se sabe”. -Con el rey se puede ver las ganas del hombre de poder dominar todo y la manipulación, pero al mismo tiempo se habla de no exigir a las demás personas cosas que no pueden. - Con el vanidoso se ve el valor de la humildad. - Con el bebedor se puede ver la importancia de no caer en el sinsentido. Todas estas y más enseñanzas que se dan en este libro y lamentablemente no se terminan de ver en la película. Como conclusión no recomiendo ver la película sin antes haber leído el libro, además que recomiendo sólo ver esta película bajo tu propio riesgo.",
        "content_type": "html",
        "cover": null,
        "tags": [
            "análisis",
            "pensamientos",
            "pensamento"
        ]
    },
    {
        "id": 13,
        "title": "El amor",
        "author": "spiegel",
        "date": "2021-09-13T23:01:53Z",
        "content": "“El amor no reclama posesiones si no que da libertad” Rabindranath Tagore. El amor una cosa que es misteriosa, protagonista de muchas obras. Se dice que el amor es un impulso que de manera directa e indirecta hace que estemos aquí, tan solo algo temporal, compleja mercadotecnia para vender productos, para una sociedad en busca de cariño y afecto. Por eso para los católicos es el impulso que tenemos para hacer los cosas. No cabe la menor duda de que a lo largo de muchos años se ha venido una idea errónea de lo que es el amor, confundiéndose de esta manera con el enamoramiento, mismo que según el académico de la Unison, Raúl Martínez Mir dura de 6 a 8 meses hasta un máximo de 2 años y medio. Esto se debe a que el Al principio el cerebro segrega serotonina, la hormona de la felicidad, y –paulatinamente– cuando se va dando la adaptación, los niveles de serotonina bajan y puede disminuir el enamoramiento y sustituirse por el amor de pareja. Esto nos indica que de manera lógica sería impensable dar por hecho de que solo por este condicionamiento es posible llegar a tener una relación romántica a largo plazo con una persona. Por ello estoy seguro de que es importante conocer la verdadera cara del amor. A partir de lo anterior identificaremos los tres diferentes tipos de amor que existen bíblicamente: -Amor filial: Es un tipo de amor que se tiene como de una madre a un hijo o también como un hermano hacia su hermano, o de una persona hacia su amigo, es un tipo de amor que con base a lo anterior está claro que no se debe de manera romántica alguna. -Amor eros: Es el amor que tiene una relación romántica de por medio, es el tipo de amor que busca la procreación para la expansión de la especie, el amor que le tiene una persona a su pareja o a su esposa, que principalmente se basa en el deseo sexual. Sin embargo, no se debe de confundir con el enamoramiento, aunque similar es más complejo porque de manera en que el enamoramiento solo funge durante algún tiempo efímero en cambio el eros es más que eso, ya que tiene otras cosas en cuenta como los defectos de la persona y el cómo se maneja. -Amor ágape: Este es el tipo de amor que es una decisión, tiene en cuenta que la otra persona, ya sea familiar, amigo o pareja tiene sus fortalezas y debilidades, se tiene que poder tener una aceptación a todas ellas y saber que no las tiene porque cambiar y tu no las tienes que tolerar, porque como previamente mencione se tiene que aceptar, por ende puede y causa mucho sufrimiento en el proceso de la aceptación a la otra persona, sobre todo cuando se acaba el enamoramiento y es cuando muchas parejas cortan y muchas amistades desfallecen. Para que se pueda lograr eso se deben tener metas en común con la persona, en fin y al cabo algo que compartir para que de esta manera después de eso empieza este complicado proceso. Podría parecer que este amor está en oposición con los otros dos tipos de amores, podría parecerlo así, pero por consiguiente este no tendría lo propio que tiene este tipo de amor. Por tanto, se tienen que considerar para este tipo de amor. Recapitulando, el tipo de amor que menos hay actualmente es el que requiere un compromiso en otras palabras el ágape, porque es el más difícil del lograr, resumiendo existen tres tipos de amor: eros filio y ágape. En el caso cuando es en relaciones de amistad es el filio, este existe siempre y cuando no existan las intenciones románticas y puede ser ágape siempre y cuando sea una decisión a lograr el amor perfecto. Por último, me gustaría hacerte una invitación a ti lector a amar, cierro con la definición del amor según san Pablo. “El amor es paciente, es servicial; el amor no es envidioso, no hace alarde, no se envanece, no procede con bajeza, no busca su propio interés, no se irrita, no tiene en cuenta el mal recibido, no se alegra de la injusticia, sino que se regocija con la verdad. El amor todo lo disculpa, todo lo cree, todo lo espera, todo lo soporta. El amor no pasará jamás. Las profecías acabarán, el don de lenguas terminará, la ciencia desaparecerá.”",
        "content_type": "html",
        "cover": null,
        "tags": [
            "opinión",
            "ensayo",
            "amor"
        ]
    },
    {
        "id": 14,
        "title": "La motivación y el trabajo",
        "author": "spiegel",
        "date": "2021-09-03T03:15:02Z",
        "content": "“No todo es motivación, si solo trabajas cuando estás inspirado estás destinado al fracaso.” A quien corresponda. Muchas veces me doy cuenta de la falta de inspiración o falta de entusiasmo que tengo por hacer las cosas, siempre que me pasa esto recuerdo la frase anterior y pienso: Para ser exitoso en la vida no puedo depender únicamente de mi inspiración, tengo que trabajar, porque la suerte solo favorece a los que están preparados. Dentro de lo que cabe es fácil pensar todo esto, pero al momento de llevarlo a la practica surgen intrigantes, tales como: ¿Realmente esto me apasiona? ¿De qué sirve hacer las cosas si no las disfrutas? La realidad es más preocupante de lo que imagine, existen otros aspectos como la salud mental de la persona, esto según mi experiencia es un factor sumamente determinante al momento de desarrollar las actividades, es algo que no se tiene que olvidar ya que no solo afecta al momento de desarrollar las actividades que le corresponden a la persona, si no que también afecta de manera real en la vida privada de la persona. Sin lugar a dudas otro factor que se tiene que tomar en cuenta es la sociedad en el proceso. Realmente la sociedad en el proceso puede ayudar o perjudicar a la salud mental del individuo, esto se debe más que nada a nuestra propia naturaleza. Para finalizar más que nada, exhorto a ti querido lector a que tomes conciencia de tu propia salud mental y de la de las personas que te rodean, es de valientes pedir ayuda cuando no se puede valse por uno mismo.",
        "content_type": "html",
        "cover": null,
        "tags": [
            "trabajo",
            "motivación"
        ]
    },
    {
        "id": 15,
        "title": "Los padres callan",
        "author": "spiegel",
        "date": "2021-05-31T17:39:49Z",
        "content": "En la etapa de la adolescencia, ya es muy común ver jóvenes embarazadas, en la calle, pero la pregunta es ¿Cuál es la causa? Tal vez por la atracción sexual, la ignorancia, no estar bien informados, no tener la protección adecuada o simplemente el deseo de tener un hijo, a temprana edad. Podrían ser muchas las causas, pero lo mejor es que, a nuestra edad, estemos conscientes de todo lo negativo que esto nos puede acarrear, sobre todo porque en la actualidad estamos informados, tanto en la escuela como en los medios de comunicación. Desafortunadamente, muchos adolescentes terminan en la casa de sus padres con hijos, solo por un rato de placer o saber lo que se siente, tener relaciones sexuales. Es lamentable saber que los embarazos ocurren en promedio a las edades de, 9 a 14 años. Esos que pueden ser por curiosidad o placer. Cobrándoles la factura por no tomar en cuenta las consecuencias de, no tomar las medidas preventivas a tiempo. Por lo que tienen que dejar de estudiar y preocuparse por salir adelante, destruyendo así algunos sueños, en esta etapa de su vida. A esa edad, hacemos cosas que no tienen ningún sentido por nuestra inmadurez e inconsciencia, cometemos errores que afectan a nuestra integridad. Uno de ellos es ser papas a temprana edad. Por una calentura arruinamos todos nuestros sueños y el ser alguien en la vida también, el ser libres de hacer lo que queríamos ¿Cuántas veces no nos quejamos de la escuela, de las tareas, de nuestras casas o incluso de nuestros propios padres? Pero al cometer un error así vamos a desear que regrese el tiempo, regresar a la escuela y no tener la obligación de trabajar, estar con nuestros padres en armonía y que todo vuelva a ser como antes. Por eso es importante seguir la trillada, pero cierta frase de pensar antes de actuar, porque después no habrá vuelta atrás. Los adolescentes hemos llegado a tal punto por no informarnos de lo correcto que por un conjunto de mitos se llegan a embarazar. por ello hemos de preguntarnos ¿Qué es mejor? Cargar una mochila o una cuna y una pañalera, pues no seguir lo antes dicho ese podría ser nuestro final y siempre recuerda “no todo lo que brilla es oro”",
        "content_type": "html",
        "cover": "https://cdn-images-1.medium.com/max/640/1*6vp5UcmIvwAY1HlWLvQGQA.jpeg",
        "tags": [
            "consecuencias",
            "padres",
            "vida",
            "lamento",
            "adolescence"
        ]
    },
    {
        "id": 16,
        "title": "¿Por qué?",
        "author": "spiegel",
        "date": "2021-05-28T22:07:02Z",
        "content": "Los humanos seguido nos preguntamos el por qué de las cosas, pues como dice Blaise Pascal “Una de las principales enfermedades del hombre es su inquieta curiosidad por conocer lo que no sé puede llegar a saber.” Este es el principio básico de la sociedad actual y lo que nos define como propios seres pensantes. A partir del momento en el que nos empezamos a preguntar el por qué de todo lo que nos rodeaba y decidimos ir más allá para empezar a crear. En todo momento estamos buscando saciar nuestra curiosidad innata puesto que al hacerlo liberamos hormonas que nos hacen sentir bien con nosotros mismos y con el mundo en el que nos rodea. Personalmente puedo llegar a un punto en que las ansias por saber supera a cualquier otra necesidad que se me presenta, sin importar el método que elija para aprenderlo; pudo ser desde un Podcast, un documental, un libro, un articulo web hasta un video en YouTube. En ese momento simplemente olvido todas ganas de comer, dormir, incluso ir al baño, todas quedan mermadas por la necesidad de saber que pasara y el por qué de ese problema que me había planteado desde el inicio e incluso terminado el material mi mente sigue indagando y le doy vueltas al asunto, siguiendo más y más hasta llegar al punto de satisfacerme de conocimiento que quería saber y llegados a este punto si lo realice de buena manera al final termino con más dudas que respuestas, solo para darme cuenta de que han pasado más de dos horas viendo el porqué de mi vida en una página de internet. Entre indago más me doy cuenta de que las anisas de saber son como una enfermedad que se pasa de persona a persona, eso es lo que hace un excelente maestro en las personas nos da las ansias de aprender de lo que él puede ofrecernos, así sucedió cuando en primero de prepa tuve un maestro que intereso auténticamente en enseñarnos y como un virus les llego a hasta los más torpes del curso, esa fue la muestra mas ferviente de como se pasa el conocimiento, como si de un virus o enfermedad tratase. Al final yo creo como dijo Einstein “Somos arquitectos de nuestro propio destino” y en base al conocimiento aplicado con las preguntas correctas, podemos llegar a lugares a los cuales nunca pensaríamos posible llegar. Ahora te invito a que también te preguntes porque, para que las ganas de aprender de todos los que te rodean cambien para mejor sus vidas.",
        "content_type": "html",
        "cover": "https://cdn-images-1.medium.com/max/470/1*YXmdkY0aWGovKe8N0OU4lw.jpeg",
        "tags": [
            "why",
            "personal"
        ]
    }
]

// === Load Blog Posts ===
async function loadBlogPosts(filterAuthor = null) {
    try {
        let initialPosts = [];

        // Try to fetch from JSON file (works on GitHub Pages and HTTP servers)
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            } else {
                // Use fallback data if fetch fails
                initialPosts = initialBlogData;
            }
        } catch (fetchError) {
            // Use fallback data for local file:// protocol
            console.log('Using embedded blog data (file:// protocol detected)');
            initialPosts = initialBlogData;
        }

        // Get posts from localStorage
        const storedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');

        // Get deleted posts IDs
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        // Combine and sort posts (newest first)
        let allPosts = [...initialPosts, ...storedPosts];

        // Filter out deleted posts
        allPosts = allPosts.filter(post => !deletedIds.includes(post.id));

        // Filter by author if specified
        if (filterAuthor) {
            allPosts = allPosts.filter(post => post.author === filterAuthor);
        }

        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render posts
        renderPosts(allPosts);

        // Update counters
        updateCounters(allPosts.length);

    } catch (error) {
        console.error('Error loading blog posts:', error);
        showErrorMessage();
    }
}

// === Render Posts to DOM ===
function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="info-text" style="text-align: center; padding: 40px;">No posts found. Be the first to create one!</p>';
        return;
    }

    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

// === Create Post HTML ===
function createPostHTML(post) {
    const date = formatDate(post.date);
    const tags = post.tags || [];

    return `
    <article class="post">
            <div class="post-meta">
                <span class="post-author">${escapeHTML(post.author)}</span>
                <span class="post-date">· ${date}</span>
            </div>
            <h2 class="post-title" onclick="viewPost(${post.id})">${escapeHTML(post.title)}</h2>
            <div class="post-content">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
            ${tags.length > 0 ? `
                <div class="post-tags">
                    ${tags.map(tag => `<span class="tag-pill">${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''
        }
        </article>
    `;
}

// === View Individual Post ===
function viewPost(postId) {
    window.location.href = `post.html?id=${postId}`;
}

// === Format Date ===
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// === Escape HTML to prevent XSS ===
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Update Counters ===
function updateCounters(postCount) {
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.textContent = postCount;
    }
}

// === Setup Author Filter Dropdown ===
function setupAuthorFilter() {
    const filterDropdown = document.getElementById('author-filter');

    if (filterDropdown) {
        filterDropdown.addEventListener('change', function (e) {
            const selectedAuthor = e.target.value;

            if (selectedAuthor === 'all') {
                loadBlogPosts();
            } else {
                loadBlogPosts(selectedAuthor);
            }
        });
    }
}

// === Setup Hidden Login Access (Easter Egg) ===
function setupHiddenLoginAccess() {
    const footerSecret = document.getElementById('footer-secret');
    let clickCount = 0;
    let clickTimer = null;

    if (footerSecret) {
        footerSecret.addEventListener('click', function () {
            clickCount++;

            // Reset counter after 2 seconds
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);

            // Triple click to access login
            if (clickCount === 3) {
                window.location.href = 'login.html';
            }
        });
    }
}

// === Show Error Message ===
function showErrorMessage() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = `
    <div class="message error show">
        <p>ERROR: Failed to load blog posts. Please check your connection and try again.</p>
    </div>
    `;
}

// === Theme Toggle ===
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon
            const themeIcon = this.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '☾' : '☀';
            }
        });
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☾' : '☀';
    }
}
// === Language Toggle ===
function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function () {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            localStorage.setItem('language', currentLang);

            const langText = this.querySelector('.lang-text');
            if (langText) {
                langText.textContent = currentLang.toUpperCase();
            }

            updateUILanguage();
            loadBlogPosts();
        });
    }
}

function loadLanguage() {
    currentLang = localStorage.getItem('language') || 'en';
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = currentLang.toUpperCase();
    }
    updateUILanguage();
}

function updateUILanguage() {
    const t = translations[currentLang];

    // Update nav
    const homeLink = document.querySelector('.nav-link.active');
    if (homeLink) homeLink.textContent = t.home;

    const filterLabel = document.querySelector('.filter-label');
    if (filterLabel) filterLabel.textContent = t.filterAuthor;

    // Update author select options
    const authorSelect = document.getElementById('author-filter');
    if (authorSelect) {
        authorSelect.options[0].text = t.allPosts;
        authorSelect.options[1].text = t.anonymous.toUpperCase();
        authorSelect.options[2].text = t.otreva.toUpperCase();
        authorSelect.options[3].text = t.spiegel.toUpperCase();
    }

    // Update status bar
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems[0]) {
        statusItems[0].innerHTML = `${t.status} <span class="online">${t.online}</span>`;
    }
    if (statusItems[1]) {
        statusItems[1].innerHTML = `${t.users} <span id="user-count">3</span>`;
    }
    if (statusItems[2]) {
        const currentCount = document.getElementById('post-count')?.textContent || '0';
        statusItems[2].innerHTML = `${t.posts} <span id="post-count">${currentCount}</span>`;
    }
}
