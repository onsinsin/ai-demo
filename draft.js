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







function findNodeInTree(tree, name) {
  if (!tree || !tree.length) return null;
  for (let node of tree) {
    if (node.orgName === name || name.indexOf(node.orgName)>=0) {
      return node;
    }
    const child = findNodeInTree(node.children, name);
    if (child) return child;
  }
  return null;
}
function main({orgRes, orgName}) {
  let orgNode = null;
  if(!(orgName == null || orgName == '')) {
    try {
      const orgResJson = JSON.parse(orgRes);
      if (orgResJson && orgResJson.success && orgResJson.data) {
        let node = orgResJson.data;
        orgNode = { orgCode: orgResJson.data.orgCode, orgName: orgResJson.data.orgName, orgLevel: orgResJson.data.orgLevel};
        let matchNode = findNodeInTree(orgResJson.data.children || [], orgName)
        if (matchNode) {
          node = matchNode;
        }
        orgNode = { orgCode: node.orgCode, orgName: node.orgName, orgLevel: node.orgLevel};
      }
    } catch(err) {
    }
  }
  return {
      result: orgNode
  }
}