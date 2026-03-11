export default class DiscretePortMarkup extends Communicator.Markup.MarkupItem {
    private _hwv: Communicator.WebViewer
    private _isFinalized: boolean

    // private _selectedPointColor = new Communicator.Color(83, 102, 175)
    // private _selectedRectangleColor = new Communicator.Color(8, 188, 216)
    private _selectedPointColor = new Communicator.Color(215, 52, 53)
    private _selectedRectangleColor = new Communicator.Color(215, 52, 53)
    private _selectedLine1Color = new Communicator.Color(0, 127, 255)
    private _selectedLine2Color = new Communicator.Color(238, 130, 238)

    private _unSelectedColor = new Communicator.Color(203, 203, 202)

    private _isSelected = true
    private _hidePort = false

    portNumber: string = ''
    shapeType: string = ''
    points: Communicator.Point3[] = []

    constructor(hwv: Communicator.WebViewer, pointList: Communicator.Point3[], portNumber: number, shapeType: string) {
        super()
        this._hwv = hwv
        this._isFinalized = false
        this.portNumber = portNumber + ''
        this.shapeType = shapeType
        this.addPoints(pointList)
    }

    setSelected(status: boolean) {
        this._isSelected = status
    }

    setHidden(status: boolean) {
        this._hidePort = status
    }

    getDistance(point1: Communicator.Point3, point2: Communicator.Point3) {
        return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2 + (point1.z - point2.z) ** 2)
    }

    addPoints(points: Communicator.Point3[]) {
        if (points.length === 4) {
            const [point1, point2, point3, point4] = points
            const distances = [
                this.getDistance(point1, point3),
                this.getDistance(point1, point4),
                this.getDistance(point2, point3),
                this.getDistance(point2, point4)
            ]
            const minDist = Math.min.apply(null, distances)
            const minIndex = distances.indexOf(minDist)
            switch (minIndex) {
                case 0:
                    this.points.push(...[point2, point1, point3, point4])
                    break
                case 1:
                    this.points.push(...[point2, point1, point4, point3])
                    break
                case 2:
                    this.points.push(...[point1, point2, point3, point4])
                    break
                case 3:
                    this.points.push(...[point1, point2, point4, point3])
                    break
            }
        } else {
            this.points.push(...points)
        }
    }

    getMidPoint(point1: Communicator.Point3, point2: Communicator.Point3) {
        const x1 = (point1.x + point2.x) / 2
        const y1 = (point1.y + point2.y) / 2
        const z1 = (point1.z + point2.z) / 2
        return new Communicator.Point3(x1, y1, z1)
    }

    drawPoint(point: Communicator.Point3, color: Communicator.Color, radius: number) {
        const view = this._hwv.view
        const markupManager = this._hwv.markupManager

        const circle = new Communicator.Markup.Shape.Circle(),
            point3d = view.projectPoint(point)

        circle.set(Communicator.Point2.fromPoint3(point3d), radius);
        circle.setFillColor(color)
        markupManager.getRenderer().drawCircle(circle);
    }

    drawText(point: Communicator.Point3) {
        const view = this._hwv.view
        const markupManager = this._hwv.markupManager

        const point3d = view.projectPoint(point)
        const position = Communicator.Point2.fromPoint3(point3d)
        const text = new Communicator.Markup.Shape.Text(this.portNumber, position)

        markupManager.getRenderer().drawText(text);
    }

    drawRectangle(point: Communicator.Point3, color: Communicator.Color, size: number) {
        const view = this._hwv.view
        const markupManager = this._hwv.markupManager

        const point3d = view.projectPoint(point)
        const rectanle = new Communicator.Markup.Shape.Rectangle()

        const position2D = Communicator.Point2.fromPoint3(point3d)
        const position2Dmove = new Communicator.Point2(position2D.x - size / 2, position2D.y - size / 2)
        rectanle.setPosition(position2Dmove);
        rectanle.setSize(new Communicator.Point2(size, size))
        rectanle.setFillColor(color)
        markupManager.getRenderer().drawRectangle(rectanle);
    }

    drawLine(point1: Communicator.Point3, point2: Communicator.Point3, color: Communicator.Color, width: number) {
        const view = this._hwv.view
        const markupManager = this._hwv.markupManager

        const line = new Communicator.Markup.Shape.Line()
        const point3d1 = view.projectPoint(point1) as any
        const point3d2 = view.projectPoint(point2) as any

        line.set(point3d1, point3d2)
        line.setStrokeWidth(width)
        line.setStrokeColor(color)
        markupManager.getRenderer().drawLine(line)
    }

    drawPolygon(points: Communicator.Point3[], opacity: number, strokeWidth: number, color?: Communicator.Color) {
        const view = this._hwv.view
        const markupManager = this._hwv.markupManager

        const polygon = new Communicator.Markup.Shape.Polygon()

        for (const point of points) {
            const point3d = view.projectPoint(point) as any
            polygon.pushPoint(point3d)
        }
        polygon.setFillOpacity(opacity)
        polygon.setStrokeWidth(strokeWidth)
        color && polygon.setFillColor(color)

        markupManager.getRenderer().drawPolygon(polygon)
    }

    drawDirection(midPoint1: Communicator.Point3, midPoint2: Communicator.Point3, midPoint5: Communicator.Point3) {
        const direcVetor = {
            x: midPoint2.x - midPoint1.x,
            y: midPoint2.y - midPoint1.y,
            z: midPoint2.z - midPoint1.z
        }
        const L = Math.sqrt(direcVetor.x ** 2 + direcVetor.y ** 2 + direcVetor.z ** 2)

        const perpendicularVector = {
            x: -direcVetor.y,
            y: direcVetor.x,
            z: 0
        }

        const dy = Math.abs(direcVetor.y)
        const dx =  Math.abs(direcVetor.x)
        const dz =  Math.abs(direcVetor.z)
        if (dy > 1 && dx > 1) {
            perpendicularVector.x = -direcVetor.y / L
            perpendicularVector.y = direcVetor.x / L
        } else if (dy > 1) {
            perpendicularVector.x = -direcVetor.y / L
        } else if (dx > 1) {
            perpendicularVector.y = direcVetor.x / L
        }

        const direcVetor2 = {
            x: midPoint2.x - midPoint5.x,
            y: midPoint2.y - midPoint5.y,
            z: midPoint2.z - midPoint5.z
        }
        const LL = Math.sqrt(direcVetor2.x ** 2 + direcVetor2.y ** 2 + direcVetor2.z ** 2)
        const max =  Math.max(Math.abs(perpendicularVector.y), Math.abs(perpendicularVector.x))
        const d = max > LL ? LL : max
        const tt = d / LL
        const x4 = midPoint5.x + (midPoint2.x - midPoint5.x) * tt
        const y4 = midPoint5.y + (midPoint2.y - midPoint5.y) * tt
        const z4 = midPoint5.z + (midPoint2.z - midPoint5.z) * tt
        const toP = new Communicator.Point3(x4, y4, z4)



        const p1Square = {
            x: midPoint5.x + 0.5 * perpendicularVector.x,
            y: midPoint5.y + 0.5 * perpendicularVector.y,
            z: midPoint5.z + 0.5 * perpendicularVector.z
        }
        const p2Square = {
            x: midPoint5.x - 0.5 * perpendicularVector.x,
            y: midPoint5.y - 0.5 * perpendicularVector.y,
            z: midPoint5.z - 0.5 * perpendicularVector.z
        }

        const perpendicularVector2 = {
            x: 0,
            y: direcVetor.z,
            z: -direcVetor.y
        }


        if (dy > 1 && dz > 1) {
            perpendicularVector2.z = -direcVetor.y / L
            perpendicularVector2.y = direcVetor.z / L
        } else if (dy > 1) {
            perpendicularVector2.z = -direcVetor.y / L
        } else if (dz > 1) {
            perpendicularVector2.y = direcVetor.z / L
        }
        const p3Square = {
            x: midPoint5.x + 0.5 * perpendicularVector2.x,
            y: midPoint5.y + 0.5 * perpendicularVector2.y,
            z: midPoint5.z + 0.5 * perpendicularVector2.z
        }
        const p4Square = {
            x: midPoint5.x - 0.5 * perpendicularVector2.x,
            y: midPoint5.y - 0.5 * perpendicularVector2.y,
            z: midPoint5.z - 0.5 * perpendicularVector2.z
        }

        const squareP1 = new Communicator.Point3(p1Square.x, p1Square.y, p1Square.z)
        const squareP2 = new Communicator.Point3(p2Square.x, p2Square.y, p2Square.z)
        const squareP3 = new Communicator.Point3(p3Square.x, p3Square.y, p3Square.z)
        const squareP4 = new Communicator.Point3(p4Square.x, p4Square.y, p4Square.z)

        const direcPolygonColor = new Communicator.Color(172, 0, 0)
        this.drawPolygon([squareP1, squareP2, toP], 1, 0.1, direcPolygonColor)
        this.drawPolygon([squareP2, squareP3, toP], 1, 0.1, direcPolygonColor)
        this.drawPolygon([squareP1, squareP3, squareP2, squareP4], 1, 0.1, direcPolygonColor)
        this.drawPolygon([squareP1, squareP4, toP], 1, 0.1, direcPolygonColor)
        this.drawPolygon([squareP2, squareP3, toP], 1, 0.1, direcPolygonColor)
        this.drawPolygon([squareP2, squareP4, toP], 1, 0.1, direcPolygonColor)
    }

    draw() {
        if (this._hidePort) {
            return
        }
        const pointColor = this._isSelected ? this._selectedPointColor : this._unSelectedColor
        const rectangleColor = this._isSelected ? this._selectedRectangleColor : this._unSelectedColor
        const line1Color = this._isSelected ? this._selectedLine1Color : this._unSelectedColor
        const line2Color = this._isSelected ? this._selectedLine2Color : this._unSelectedColor
        const pointRadius = 4
        const rectangleSize = 7
        const lineWidth = 4

        if (this.points.length === 4) {
            const [p1, p2, p3, p4] = this.points
            const midPoint1 = this.getMidPoint(p1, p2)
            const midPoint2 = this.getMidPoint(p3, p4)
            const midPoint3 = this.getMidPoint(p1, p4)
            const midPoint4 = this.getMidPoint(p3, p2)
            // const midPoint5 = this.getMidPoint(midPoint1, midPoint2)

            this.drawText(midPoint1)
            this.drawRectangle(midPoint1, rectangleColor, rectangleSize)
            // this.drawPoint(midPoint1, pointColor, pointRadius)

            // ---
            // this.#drawPoint(midPoint2, pointColor, pointRadius)

            // this.#drawPoint(midPoint3, pointColor, pointRadius)
            // this.#drawPoint(midPoint4, pointColor, pointRadius)

            // this.#drawPoint(midPoint5, pointColor, pointRadius)
            // ---

            this.drawLine(midPoint1, midPoint2, line1Color, lineWidth)
            this.drawLine(midPoint3, midPoint4, line2Color, lineWidth)

            this.drawPolygon(this.points, 0.2, 0.3)

            // todo
            // this.drawDirection(midPoint1, midPoint2, midPoint5)
        } else if (this.points.length === 2) {
            const [p1, p2] = this.points
            this.drawText(p1)
            this.drawLine(p1, p2, line1Color, lineWidth)

            if (this.shapeType === 'DISCRETEFACE') {
                this.drawRectangle(p1, rectangleColor, rectangleSize)
            } else {
                this.drawPoint(p1, pointColor, pointRadius)
            }
        }
    }

    hit(point: Communicator.Point2): boolean {
        //camera 默认为右手系坐标
        if (this.points.length === 2) {
            const [p1, p2] = this.points
            const cP1 = this.getScreenPosition(p1)
            const cP2 = this.getScreenPosition(p2)
            return this.isPointInsideRectangle(this.getRectangle(cP1, cP2), point)
        } else if (this.points.length === 4) {
            const [p1, p2, p3, p4] = this.points

            const cP1 = this.getScreenPosition(p1)
            const cP2 = this.getScreenPosition(p2)
            const cP3 = this.getScreenPosition(p3)
            const cP4 = this.getScreenPosition(p4)

            return this.isPointInsideRectangle([cP2, cP4, cP1, cP3], point)
        }

        return false
    }

    //通过直线上的两个点得到以其为中线，宽度为4的矩形点
    getRectangle(mP1: Communicator.Point2, mP2: Communicator.Point2): Communicator.Point2[] {
        const normalAB = new Communicator.Point2(-(mP2.y - mP1.y), mP2.x - mP1.x) //得P1,P2过中点法向量
        const L = Math.sqrt(normalAB.x ** 2 + normalAB.y ** 2)

        const hight = 6
        const p1 = new Communicator.Point2((-hight / L) * normalAB.x, (-hight / L) * normalAB.y).add(mP1) //左下点
        const p2 = new Communicator.Point2((hight / L) * normalAB.x, (hight / L) * normalAB.y).add(mP2) // 右上点
        const p3 = new Communicator.Point2((hight / L) * normalAB.x, (hight / L) * normalAB.y).add(mP1) //左上点
        const p4 = new Communicator.Point2((-hight / L) * normalAB.x, (-hight / L) * normalAB.y).add(mP2) //右下点

        return [p1, p2, p3, p4]
    }

    isPointInsideRectangle(points: Communicator.Point2[], desPoint: Communicator.Point2): boolean {
        //这里的四个点为矩形边框的四个顶点
        const [p1, p2, p3, p4] = points
        const resA = this.inTriangle([p1, p2, p3], desPoint)
        const resB = this.inTriangle([p1, p2, p4], desPoint)
        if (resA || resB) {
            return true
        } else {
            return false
        }
    }

    //获取3D点对应屏幕上的位置
    getScreenPosition(point: Communicator.Point3): Communicator.Point2 {
        //得到屏幕大小
        const viewDom = document.getElementById(this._hwv.getCreationParameters().containerId as string)
        const rect = viewDom?.getBoundingClientRect()
        const width = rect?.width
        const height = rect?.height

        const cameraMat = this._hwv.view.getFullCameraMatrix() //将坐标点转换到默认camera坐标系下，范围是2*2的相机
        const cPoint = cameraMat.transform(point)
        const resPoint = new Communicator.Point2((cPoint.x + 1) * (width ? width : 0) / 2, (1 - cPoint.y) * (height ? height : 0) / 2)
        return resPoint
    }

    //计算点是否在points构成的三角形内
    inTriangle(points: Communicator.Point2[], destPos: Communicator.Point2): boolean {
        if (points.length !== 3) {
            return false
        }
        const [pA, pB, pC] = points
        const vAB = new Communicator.Point2((pB.x - pA.x), (pB.y - pA.y))
        const vBC = new Communicator.Point2((pC.x - pB.x), (pC.y - pB.y))
        const vCA = new Communicator.Point2((pA.x - pC.x), (pA.y - pC.y))
        const vAD = new Communicator.Point2((destPos.x - pA.x), (destPos.y - pA.y))
        const vBD = new Communicator.Point2((destPos.x - pB.x), (destPos.y - pB.y))
        const vCD = new Communicator.Point2((destPos.x - pC.x), (destPos.y - pC.y))

        const crossA = vAB.x * vAD.y - vAB.y * vAD.x
        const crossB = vBC.x * vBD.y - vBC.y * vBD.x
        const crossC = vCA.x * vCD.y - vCA.y * vCD.x

        if ((crossA * crossB < 0) || (crossA * crossC < 0) || (crossB * crossC < 0)) {
            return false
        }
        return true;
    }

    finalize() {
        this._isFinalized = true
        this._hwv.markupManager.refreshMarkup()
    }
}
