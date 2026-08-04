import autocannon from "autocannon";


const payload = JSON.stringify({
    logs: Array.from(
        { length: 100 },
        (_, i) => ({
            timestamp:
                new Date().toISOString(),

            level: "info",

            service: "api",

            message: `request ${i}`,

            attributes: {
                source: "load-test"
            }
        })
    )
});


autocannon(
    {
        url: "http://localhost:8080/logs",

        method: "POST",

        connections: 50,

        duration: 30,

        headers: {
            "content-type": "application/json"
        },

        setupClient(client) {

            client.setBody(payload);

        }

    },

    (err, result) => {

        if (err) {
            console.error(err);
            return;
        }

        console.log(result);

    }
);