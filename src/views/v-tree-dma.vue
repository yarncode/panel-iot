<script lang="ts" setup>
import { defineComponent, ref, reactive, onMounted, watch, computed } from 'vue'
import * as vNG from 'v-network-graph'
import { type Nodes, type Edges, type Layouts, type Paths } from 'v-network-graph'
import {
  ForceLayout,
  type ForceNodeDatum,
  type ForceEdgeDatum,
} from 'v-network-graph/lib/force-layout'
import { layouts } from 'chart.js'
import dagre from 'dagre'

const nodeSize = 40 // size of the node in pixels

const data = reactive({
  nodes: {
    node1: { name: "DMA 500" },
    node2: { name: "DMA 200" },
    node3: { name: "DMA 200" },
    node4: { name: "DMA 200" },
    node5: { name: "DMA 100" },
    node6: { name: "DMA 50" },
    node7: { name: "DMA 50" },
    node8: { name: "DMA 25" },
    node9: { name: "DMA 25" },
  } as Nodes,
  edges: {
    /* node 1 */
    edge1: { source: "node1", target: "node2" },
    edge2: { source: "node1", target: "node3" },
    edge3: { source: "node1", target: "node4" },
    /* node 2 */
    edge4: { source: "node2", target: "node5" },
    edge5: { source: "node2", target: "node6" },
    /* node 6 */
    edge6: { source: "node6", target: "node8" },
    edge7: { source: "node6", target: "node9" },
    /* node 4 */
    edge8: { source: "node4", target: "node7" },
  } as Edges,
  paths: {
    path1: { edges: ["edge1", "edge4"] },
  } as Paths,
  layouts: {
    nodes: {},
  } as Layouts,
})
const graph = ref<vNG.VNetworkGraphInstance>()

const configs = vNG.defineConfigs({
  view: {
    autoPanAndZoomOnLoad: "fit-content",
    onBeforeInitialDisplay: () => layout("TB"),
  },
  node: {
    normal: { radius: nodeSize / 1.2, color: '#036ffc' },
    label: {
      direction: "center",
      color: '#fff',
    },
  },
  edge: {
    normal: {
      color: "#aaa",
      width: 3,
    },
    margin: 4,
    marker: {
      target: {
        type: "arrow",
        width: 4,
        height: 4,
      },
    },
  },
  path: {
    visible: true,
    normal: {
      width: 10,
      dasharray: "10 16",
      animate: true,
      animationSpeed: 40,
    },
  }
})

function layout(direction: "TB" | "LR") {
  if (Object.keys(data.nodes).length <= 1 || Object.keys(data.edges).length == 0) {
    return
  }

  // convert graph
  // ref: https://github.com/dagrejs/dagre/wiki
  const g = new dagre.graphlib.Graph()
  // Set an object for the graph label
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSize * 2,
    edgesep: nodeSize,
    ranksep: nodeSize * 2,
  })
  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  Object.entries(data.nodes).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize })
  })

  // Add edges to the graph.
  Object.values(data.edges).forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach((nodeId: string) => {
    // update node position
    const x = g.node(nodeId).x
    const y = g.node(nodeId).y
    data.layouts.nodes[nodeId] = { x, y }
  })
}

function updateLayout(direction: "TB" | "LR") {
  // Animates the movement of an element.
  graph.value?.transitionWhile(() => {
    layout(direction)
  })
}

</script>

<template>
  <section class="p-4">
    <header class="text-lg font-bold mb-4">
      <i class="fi fi-rr-tree mr-2"></i> VTree DMA
    </header>
    <article class="grid gap-4 h-[500px]">
      <div>
        <div class="demo-control-panel">
          <el-button @click="updateLayout('LR')">Layout: Left to Right</el-button>
          <el-button @click="updateLayout('TB')">Layout: Top to Bottom</el-button>
        </div>
        <!-- Add your content here -->
        <v-network-graph ref="graph" class="graph" :nodes="data.nodes" :edges="data.edges" :paths="data.paths"
          :layouts="data.layouts" :configs="configs">
        </v-network-graph>
      </div>
    </article>
  </section>
</template>