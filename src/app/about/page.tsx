
export default function About() {
    return (
        <section className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
            <h3 className="font-bold text-xl">RunTracer</h3>
            <p>RunTracer is an application intended for users to track any form of activity and travel, including, but not limited to, running, walking, biking, and driving.</p>
            <p>Users can save their route history by signing in or signing up using the appropriate buttons on the navigation bar.</p>
            <h3 className="font-bold text-xl mt-4">How to use</h3>
            <p>On the map, there are three modes: Click mode, Route mode, and Draw mode.</p>
            <p>In <span className="font-bold">click mode</span>, every click is a point that connects to the previous one and the total distance is displayed. This allows for a route to be a series of straight, connected lines.</p>
            <p>In <span className="font-bold">route mode</span>, users enter a desired distance and start point, and a route of the desired distance is automatically prepared for them which begins and ends at the specified start point.</p>
            <p>In <span className="font-bold">draw mode</span>, users draw their path and the corresponding distance is displayed.</p>
            <p>Users can additionally enter the type of activity that they are performing. If no activity is entered, it will default to running.</p>
        </section>
    );
}