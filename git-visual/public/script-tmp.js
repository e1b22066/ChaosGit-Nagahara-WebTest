// ノードとエッジの描画関数
function drawGraph(commits) {
    const svg = d3.select("#graph")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    // ノードの描画
    const nodes = svg.selectAll("g.node")
                     .data(commits)
                     .enter()
                     .append("g")
                     .attr("class", "node")
                     .attr("transform", (d, i) => `translate(${100}, ${i * 100 + 50})`);

    nodes.append("circle")
         .attr("r", 20)
         .attr("fill", "blue");

    // ノードに情報を表示する（マウスオーバーでのみ表示）
    nodes.append("text")
         .text(d => `${d.author}\n${d.date}\n${d.message}`)
         .attr("x", 30)
         .attr("y", -15)
         .attr("text-anchor", "right")
         .attr("fill", "black")
         .attr("font-size", "13px")
         .attr("class", "node-text")
         .style("visibility", "hidden");

    nodes.on("mouseover", function() {
        d3.select(this).select(".node-text").style("visibility", "visible");
    })
    .on("mouseout", function() {
        d3.select(this).select(".node-text").style("visibility", "hidden");
    });

    // エッジの描画
    for (let i = 0; i < commits.length - 1; i++) {
        const startY = (i * 100) + 50 + 20; // 始点の y 座標をノードの中心に
        const endY = ((i + 1) * 100) + 30; // 終点の y 座標を次のノードの中心に

        svg.append("line")
           .attr("x1", 100)
           .attr("y1", startY)
           .attr("x2", 100)
           .attr("y2", endY)
           .attr("stroke", "gray")
           .attr("stroke-width", 2);
    }
}


// コミット情報を取得する関数
async function fetchCommits() {
    const response = await fetch('http://localhost:3000/commits');
    const data = await response.json();
    return data.commits;
}

// ページの読み込みが完了したらグラフを描画する
document.addEventListener('DOMContentLoaded', async () => {
    const commits = await fetchCommits();
    drawGraph(commits);
});
