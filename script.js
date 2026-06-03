async function analyzeResume() {

    const file =
    document.getElementById("pdfUpload").files[0];

    if(!file){
        alert("Upload PDF Resume");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function(){

        const typedArray =
        new Uint8Array(reader.result);

        const pdf =
        await pdfjsLib.getDocument(typedArray).promise;

        let text = "";

        for(let i=1;i<=pdf.numPages;i++){

            const page =
            await pdf.getPage(i);

            const content =
            await page.getTextContent();

            text += content.items
            .map(item=>item.str)
            .join(" ");
        }

        evaluateResume(text);
    }

    reader.readAsArrayBuffer(file);
}

function evaluateResume(text){

    text = text.toLowerCase();

    let score = 0;
    let suggestions = [];
    let html = "";

    const checks = [
        {
            name:"Education",
            keywords:["education"],
            points:10
        },
        {
            name:"Skills",
            keywords:["skills"],
            points:15
        },
        {
            name:"Experience",
            keywords:["experience","internship"],
            points:20
        },
        {
            name:"Projects",
            keywords:["project","projects"],
            points:15
        },
        {
            name:"Certifications",
            keywords:["certification","certifications","certificate"],
            points:10
        }
    ];

    // Email
    const emailRegex =
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

    if(emailRegex.test(text)){
        score += 5;
        html += `<p class="good">✓ Email Found</p>`;
    }else{
        suggestions.push("Add professional email address");
        html += `<p class="bad">✗ Email Missing</p>`;
    }

    // Phone
    const phoneRegex =
    /(\+91)?[6-9]\d{9}/;

    if(phoneRegex.test(text)){
        score += 5;
        html += `<p class="good">✓ Phone Number Found</p>`;
    }else{
        suggestions.push("Add phone number");
        html += `<p class="bad">✗ Phone Number Missing</p>`;
    }

    // LinkedIn
    if(text.includes("linkedin")){
        score += 5;
        html += `<p class="good">✓ LinkedIn Found</p>`;
    }else{
        suggestions.push("Add LinkedIn profile URL");
        html += `<p class="bad">✗ LinkedIn Missing</p>`;
    }

    // Sections
    checks.forEach(section=>{

        const found =
        section.keywords.some(keyword =>
            text.includes(keyword)
        );

        if(found){

            score += section.points;

            html += `
            <p class="good">
            ✓ ${section.name} Found
            </p>
            `;
        }
        else{

            suggestions.push(
                `Add ${section.name} section`
            );

            html += `
            <p class="bad">
            ✗ ${section.name} Missing
            </p>
            `;
        }
    });

    // Action verbs
    const verbs = [
        "developed",
        "created",
        "designed",
        "managed",
        "implemented",
        "built",
        "optimized",
        "led"
    ];

    let verbCount = 0;

    verbs.forEach(v=>{

        if(text.includes(v)){
            verbCount++;
        }
    });

    if(verbCount >= 3){

        score += 10;

        html += `
        <p class="good">
        ✓ Strong Action Verbs Used
        </p>
        `;
    }
    else{

        suggestions.push(
        "Use stronger action verbs"
        );

        html += `
        <p class="bad">
        ✗ Weak Action Verbs
        </p>
        `;
    }

    // Resume Length
    const words =
    text.split(/\s+/).length;

    if(words > 900){

        suggestions.push(
        "Resume appears too long"
        );
    }

    // ATS Formatting Score
    score += 5;

    // Cap at 100
    if(score > 100){
        score = 100;
    }

    document.getElementById("result")
    .innerHTML = `

    <h2 class="score">
    ATS Score : ${score}/100
    </h2>

    ${html}

    <h3>Suggestions</h3>

    <ul>
        ${
            suggestions
            .map(
             s=>`<li>${s}</li>`
            )
            .join("")
        }
    </ul>
    `;
}