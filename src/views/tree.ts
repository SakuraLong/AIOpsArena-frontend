export type Pos = [number, number]

function lessThan(n1: number, n2: number, compare: number = 0.5) {
  console.log(n1, n2, n1 - n2)
  if (n1 <= n2) return true
  else if (n1 - n2 <= compare) return true
  return false
}

class Node {
  x: number
  y: number
  w: number
  h: number
  id: number
  treeNode?: TreeNode
  crash = false
  constructor(x: number, y: number, w: number, h: number, id: number) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.id = id
  }

  pos(): Pos {
    return [this.x, this.y]
  }

  addTreeNode(treeNode: TreeNode) {
    this.treeNode = treeNode
  }

  delete() {
    this.treeNode?.delete(this)
  }

  addLine(line: Line) {
    const res = this.lineCheck(line)
    console.log('Node', res)
    if (res) this.crash = true
  }

  lineCheck(line: Line) {
    const res = line.calIntersection(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)
    console.log('Node', res)
    if (res[0] === LineType.VERTICAL) {
      if (Math.abs(res[1] - this.x) <= this.w / 2) return true
      else return false
    } else if (res[0] === LineType.HORIZONTAL) {
      if (Math.abs(res[2] - this.y) <= this.h / 2) return true
      else return false
    } else {
      if (
        lessThan(res[2], res[3]) &&
        lessThan(res[2], res[1]) &&
        lessThan(res[4], res[3]) &&
        lessThan(res[4], res[1])
      ) {
        return false
      } else if (
        lessThan(res[3], res[4]) &&
        lessThan(res[1], res[4]) &&
        lessThan(res[1], res[2]) &&
        lessThan(res[3], res[2])
      ) {
        return false
      } else return true
    }
  }

  draw(ctx: any) {
    ctx.save()
    ctx.fillStyle = this.crash ? 'rgba(200, 0, 0, 0.7)' : 'rgba(0, 0, 200, 0.4)'
    ctx.fillRect(this.x - this.w / 2, -(this.y - this.h / 2), this.w, -this.h)
    ctx.font = '10px Arial'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.id, this.x, -this.y)
    ctx.restore()
  }
}

enum LineType {
  NORMAL,
  VERTICAL,
  HORIZONTAL
}

type LineCIRES = [LineType, number, number, number, number]

class Line {
  xORy: number // angle === 90 ? x : y
  angle: number // 0 ~ 180
  id: number

  constructor(xORy: number, angle: number, id: number) {
    this.xORy = xORy
    this.angle = angle
    this.id = id
  }

  /**
   * 计算直线与边线的交点
   * @param x 左下x
   * @param y 左下y
   * @param w 宽度（x方向）
   * @param h 高度（y方向）
   */
  calIntersection(x: number, y: number, w: number, h: number): LineCIRES {
    if (this.angle === 90) {
      return [LineType.VERTICAL, this.xORy, 0, this.xORy, 0]
    }
    if (this.angle === 0) {
      return [LineType.HORIZONTAL, 0, this.xORy, 0, this.xORy]
    }
    const y0 = this.xORy
    const tan = Math.tan((Math.PI * this.angle) / 180)
    const p1 = (y - y0) / tan
    const p2 = x
    const p3 = (y + h - y0) / tan
    const p4 = x + w
    return [
      LineType.NORMAL,
      Math.round(p1 * 100) / 100,
      Math.round(p2 * 100) / 100,
      Math.round(p3 * 100) / 100,
      Math.round(p4 * 100) / 100
    ]
  }

  draw(ctx: any, extent: number) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(0, 255, 255, 1)'
    if (this.angle === 90) {
      ctx.moveTo(this.xORy, extent / 2)
      ctx.lineTo(this.xORy, -extent / 2)
    } else if (this.angle === 0) {
      ctx.moveTo(-extent / 2, -this.xORy)
      ctx.lineTo(extent / 2, -this.xORy)
    } else {
      const y0 = this.xORy
      const tan = Math.tan((Math.PI * this.angle) / 180)
      const x1 = (-extent / 2 - y0) / tan
      const y1 = -extent / 2
      const x2 = (extent / 2 - y0) / tan
      const y2 = extent / 2
      ctx.moveTo(x1, -y1)
      ctx.lineTo(x2, -y2)
      console.log(x1, -y1, x2, -y2)
    }
    ctx.stroke()
    ctx.restore()
  }
}

class TreeNode {
  private where = 0
  private x: number
  private y: number
  private extent: number
  private minExtent: number
  private nodes = new Map<number, Node>()
  private parentNode: TreeNode | null

  private quadrants: [TreeNode | null, TreeNode | null, TreeNode | null, TreeNode | null] = [
    null,
    null,
    null,
    null
  ]
  constructor(
    where: number,
    x: number,
    y: number,
    extent: number,
    minExtent: number,
    parentNode: TreeNode | null
  ) {
    this.where = where
    this.x = x
    this.y = y
    this.extent = extent
    this.minExtent = minExtent
    this.parentNode = parentNode
  }

  private pos(): Pos {
    return [this.x, this.y]
  }

  private subPos(pos1: Pos, pos2: Pos): Pos {
    return [pos1[0] - pos2[0], pos1[1] - pos2[1]]
  }

  private absPos(pos: Pos): Pos {
    return [Math.abs(pos[0]), Math.abs(pos[1])]
  }

  has(node: Node) {
    return this.nodes.has(node.id)
  }

  add(node: Node) {
    this.change(MapTreeChange.ADD, node)
  }

  delete(node: Node) {
    this.nodes.delete(node.id)
    if (this.nodes.size === 0) {
      this.parentNode?.deleteChildNode(this.where)
    }
    this.change(MapTreeChange.REMOVE, node)
  }

  deleteChildNode(where: number) {
    this.quadrants[where] = null
    if (
      this.nodes.size === 0 &&
      this.quadrants.reduce((pre, cur) => (cur === null ? pre + 1 : pre), 0) === 4
    ) {
      this.parentNode?.deleteChildNode(this.where)
    }
  }

  isEmpty() {
    return this.nodes.size === 0
  }

  change(type: MapTreeChange, node: Node) {
    if (type === MapTreeChange.ADD) {
      const where = this.whereIn(node)
      if (where < 4) {
        if (this.quadrants[where] === null && this.extent / 2 > this.minExtent) {
          const ne = this.extent / 2
          const off = ne / 2
          const me = this.minExtent
          const x = this.x
          const y = this.y

          // 1: 00, 2: 01, 3: 11, 4: 10

          switch (where) {
            case 0:
              this.quadrants[where] = new TreeNode(where, x + off, y + off, ne, me, this)
              break
            case 1:
              this.quadrants[where] = new TreeNode(where, x - off, y + off, ne, me, this)
              break
            case 2:
              this.quadrants[where] = new TreeNode(where, x + off, y - off, ne, me, this)
              break
            case 3:
              this.quadrants[where] = new TreeNode(where, x - off, y - off, ne, me, this)
              break
          }
        }
        this.quadrants[where]?.add(node)
      } else {
        this.nodes.set(node.id, node)
        node.addTreeNode(this)
      }
    } else if (type === MapTreeChange.REMOVE) {
      let i = 0
      for (; i < 4; i++) {
        if (this.quadrants[i]?.has(node)) {
          break
        }
      }
      if (i === 4) return
      this.quadrants[i]?.delete(node)
      if (this.quadrants[i]?.isEmpty()) {
        this.quadrants[i] = null
      }
    }
  }

  private whereIn(node: Node): number {
    const max = this.extent / 2
    const nodePos = this.subPos(node.pos(), this.pos())

    const lr = nodePos[0] - max > -max ? 0 : 1
    const tb = nodePos[1] - max > -max ? 0 : 1

    // 1: 00, 2: 01, 3: 11, 4: 10

    const where = (tb << 1) | lr

    const nodeW = node.w
    const nodeH = node.h

    const diff = this.absPos(nodePos)

    if (diff[0] < nodeW / 2 || diff[1] < nodeH / 2) {
      return 4
    }

    return where
  }

  lineCheck(line: Line) {
    console.log('lineCheck')
    const res = line.calIntersection(
      this.x - this.extent / 2,
      this.y - this.extent / 2,
      this.extent,
      this.extent
    )
    console.log('TreeNode', res)
    if (res[0] === LineType.VERTICAL) {
      if (Math.abs(res[1] - this.x) <= this.extent / 2) return true
      else return false
    } else if (res[0] === LineType.HORIZONTAL) {
      if (Math.abs(res[2] - this.y) <= this.extent / 2) return true
      else return false
    } else {
      if (
        lessThan(res[2], res[3]) &&
        lessThan(res[2], res[1]) &&
        lessThan(res[4], res[3]) &&
        lessThan(res[4], res[1])
      ) {
        return false
      } else if (
        lessThan(res[3], res[4]) &&
        lessThan(res[1], res[4]) &&
        lessThan(res[1], res[2]) &&
        lessThan(res[3], res[2])
      ) {
        return false
      } else return true
    }
  }

  draw(ctx: any) {
    ctx.save()
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(this.x - this.extent / 2, -(this.y - this.extent / 2), this.extent, -this.extent) // x, y, width, height
    ctx.stroke()
    ctx.restore()
    for (let i = 0; i < 4; i++) {
      this.quadrants[i]?.draw(ctx)
    }
  }

  addLine(line: Line) {
    const has = this.lineCheck(line)
    console.log(has)
    if (!has) return
    Array.from(this.nodes.values()).forEach((node) => {
      node.addLine(line)
    })
    this.quadrants.forEach((node) => {
      node?.addLine(line)
    })
  }
}

enum MapTreeChange {
  ADD,
  REMOVE
}

export class MapTree {
  private map = new Map<number, Node>()
  private lineMap = new Map<number, Line>()
  private ctx: any
  private extent: number
  private minExtent: number
  private root: TreeNode
  private id = 0
  private lineId = 0

  constructor(extent: number, minExtent: number) {
    this.extent = extent
    this.minExtent = minExtent
    this.root = new TreeNode(0, 0, 0, extent, minExtent, null)
  }

  setCtx(ctx: any) {
    this.ctx = ctx
  }

  add(x: number, y: number, w: number, h: number): number {
    const id = this.id++
    const node = new Node(x, y, w, h, id)
    this.map.set(id, node)
    this.root.add(node)
    return id
  }

  addLine(xORy: number, angle: number) {
    const lineId = this.lineId++
    const line = new Line(xORy, angle, lineId)
    this.lineMap.set(lineId, line)
    this.root.addLine(line)
  }

  remove(id: number) {
    const node = this.map.get(id)
    if (node !== undefined) {
      node.delete()
    }
    this.map.delete(id)
  }

  draw() {
    this.ctx.clearRect(0 - this.extent / 2, 0 - this.extent / 2, this.extent, this.extent)
    Array.from(this.map.values()).forEach((node) => {
      node.draw(this.ctx)
    })
    // this.root.draw(this.ctx)
    Array.from(this.lineMap.values()).forEach((line) => {
      line.draw(this.ctx, this.extent)
    })
  }
}
