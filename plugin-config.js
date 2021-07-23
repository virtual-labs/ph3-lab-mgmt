export default config = [
    {
        id: "plugin-bug-report",
        repo: "https://github.com/virtual-labs/svc-bug-report",
        src: "https://vjspranav.github.io/vleads-bug-report/client/app.js", // Changed probably soon
        lifecycle: "post-build",
        render: "inline" // Other options maybe could be [handlebars, ...]
    },
    {
        id: "plugin-rating",
        repo: "https://github.com/virtual-labs/svc-rating",
        lifecycle: "post-build"
    },
]