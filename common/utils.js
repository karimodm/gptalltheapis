function snakeToCamel(s) {
    return s.split('_').map((word, index) => {
        if (index === 0) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join('');
}

function hasMethod(object, methodName) {
    return typeof object[methodName] === 'function';
}

// Function to fill in the template with values from the context
function fillTemplate(templateString, context) {
    // Use a regular expression to find all placeholders and replace them with context values
    return templateString.replace(/\$\{([^}]+)\}/g, (match, name) => {
        // Return the context value if it exists, otherwise keep the placeholder
        return context.hasOwnProperty(name) ? context[name] : match;
    });
}

function extractCodeBlock(text) {
    // This regex matches the content between the first set of triple backticks.
    const regex = /```.*?\n(.*?)```/s;
    const match = regex.exec(text);
    return match ? match[1].trim() : null;
}

export default { snakeToCamel, hasMethod, fillTemplate, extractCodeBlock };