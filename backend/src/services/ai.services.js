const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getResponse(prompt) {
    const chatCompletion = await groq.chat.completions.create({
        model: "deepseek-r1-distill-llama-70b",
        messages: [
            {
                role: "user",
                content: prompt,
            },
            {
                role: "system",
                content: `
        You are an expert programming consultant. Structure your response using EXACTLY these section markers:

        [SUGGESTIONS_START]
        Provide detailed code improvement suggestions and best practices here.
        [SUGGESTIONS_END]

        [PYTHON_START] 
        Provide the improved Python code here (default language unless otherwise requested).
        [PYTHON_END]

        [JAVA_START]
        Provide Java version here (only if requested or beneficial).
        [JAVA_END]

        [C_START]
        Provide C version here (only if requested or beneficial).
        [C_END]

        [CPP_START]
        Provide C++ version here (only if requested or beneficial).
        [CPP_END]

        [COMPLEXITY_START]
        Analyze time and space complexity of the improved solution.
        [COMPLEXITY_END]

        [LINKS_START]
        Provide personalized learning resources and links.
        [LINKS_END]

        CRITICAL RULES:
        - Always use the exact section markers shown above
        - Include content between START and END markers
        - Use Python as default unless another language is specifically requested
        - Each section should contain meaningful content
        - Do not use markdown formatting within sections
    `
            },
        ],
    });

    return chatCompletion.choices[0].message.content;
}

module.exports = getResponse;
