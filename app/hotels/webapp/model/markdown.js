sap.ui.define([], function () {
    "use strict";

    /**
     * Minimal markdown → HTML converter for agent replies.
     * Handles: ### headers, **bold**, * bullets, line breaks, emoji.
     *
     * The output is fed to a FormattedText control which accepts a
     * restricted subset of HTML for safety.
     */
    return {
        toHtml: function (sText) {
            if (!sText) return "";
            let html = sText;

            // Escape any existing HTML to prevent injection
            html = html.replace(/&/g, "&amp;")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;");

            // ### Header → <strong>
            html = html.replace(/^###\s+(.+)$/gm, "<strong>$1</strong>");
            // ## Header → <strong>
            html = html.replace(/^##\s+(.+)$/gm, "<strong>$1</strong>");

            // **bold** → <strong>
            html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

            // * bullet at line start → •
            html = html.replace(/^\s*[-*]\s+(.+)$/gm, "&nbsp;•&nbsp;$1");

            // Replace line breaks with <br>
            html = html.replace(/\n/g, "<br>");

            return html;
        }
    };
});