function extractLeafNodes(tree) {
  // 存储结果
  const result = [];

  // 递归遍历函数
  function traverse(node) {
    // 条件：当前节点有 preview 属性 → 判定为叶子节点
    if (node.preview !== undefined && node.preview !== null) {
      result.push({
        id: node.id,       // 取 id
        name: node.label   // label 映射为 name
      });
      return; // 叶子节点不再遍历子级
    }

    // 如果有 children 且是数组 → 继续递归
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }

  // 遍历根节点数组
  tree.forEach(item => traverse(item));

  return result;
}

function main({layerRes}) {
  var list = [];
  try {
    var layerResJson = JSON.parse(layerRes);
    if (layerResJson && layerResJson.success && layerResJson.data) {
      list = extractLeafNodes(layerResJson.data || [])
    }
  } catch(err) {
    
  }
  return {
      result: list
  }
}
