
import { Point3D_T } from '@/types/model';
import Markuphandler from './handler/MarkupHandler';

export default class MarkupOperator  extends Communicator.Operator.OperatorBase  {

    private _hwv: Communicator.WebViewer;
    private _MarkupHandler: Markuphandler;
    constructor(hwv: Communicator.WebViewer) {
        super(hwv);
        this._hwv = hwv
        this._MarkupHandler = new Markuphandler(hwv)
    }

    // 创建markup
    public createMarkupItem() {
        return this._MarkupHandler.createMarkupItem()
    }

    // 创建箭头
    public createArrowhead(id: Communicator.Uuid, p1: Point3D_T, p2: Point3D_T) {
        this._MarkupHandler.createArrowhead(id, p1, p2)
    }
}
