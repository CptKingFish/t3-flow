const styles = { fill: "#aaa", stroke: '#fff' };

export default function Diamond({ width, height }:{ width: number, height: number }) {
    return (
        <svg className="absolute top-0 left-0 border-black border" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            <path d={`M0,${height / 2} L${width / 2},0 L${width},${height / 2} L${width / 2},${height} z`} {...styles} />
        </svg>
    );
}