const styles = { fill: "#aaa",strokeWidth: 2, stroke: '#fff' };

export default function Shape({type, width, height,className,override }:{ type:string,width: number, height: number,className:string,override?:boolean }) {

    
    const shapeTypes = {
        'circle':  <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} {...styles} />,
        'round-rect':  <rect x={0} y={0} rx={20} width={width} height={height} {...styles} />,
        'hexagon':  (
          <path
            d={`M10,0 L${width - 10},0  L${width},${height / 2} L${width - 10},${height} L10,${height} L0,${
              height / 2
            } z`}
            {...styles}
          />
        ),
        'diamond':  <path d={`M0,${height / 2} L${width / 2},0 L${width},${height / 2} L${width / 2},${height} z`} {...styles} />,
        'arrow-rect':  (
          <path
            d={`M0,0 L${width - 10},0  L${width},${height / 2} L${width - 10},${height} L0,${height} z`}
            {...styles}
          />
        ),
        'database':  (
          <path
            d={`M0,${height * 0.125}  L 0,${height - height * 0.125} A ${width / 2} ${height * 0.125} 0 1 0 ${width} ${
              height - height * 0.125
            } L ${width},${height * 0.125} A ${width / 2} ${height * 0.125} 0 1 1 0 ${height * 0.125} A ${width / 2} ${
              height * 0.125
            } 0 1 1 ${width} ${height * 0.125} A ${width / 2} ${height * 0.125} 0 1 1 0 ${height * 0.125} z`}
            {...styles}
          />
        ),
        'triangle':  <path d={`M0,${height} L${width / 2},0 L${width},${height} z`} {...styles} />,
        'parallelogram':  <path d={`M0,${height} L${width * 0.25},0 L${width},0 L${width - width * 0.25},${height} z`} {...styles} />
      };



    
    return (
        <svg className={className} width={override?width:"100%"} height={override?height:"100%"} viewBox={`0 0 ${width} ${height}`}>
            {shapeTypes[type as keyof typeof shapeTypes]}
        </svg>
    );
}