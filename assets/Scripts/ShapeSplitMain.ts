const {ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Mask)
@requireComponent(cc.PolygonCollider)
@menu("Demo/ShapeSplit/ShapeSplitMain")
export default class ShapeSplitMain extends cc.Component {
    @property(cc.Graphics) nodeGraphics: cc.Graphics = null;

    //================================================ cc.Component
    onLoad() {
        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    onDestroy() {
        CC_PREVIEW && cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    onEventKeyDown(event) {
        switch(event.keyCode) {
            case 'V'.charCodeAt(0):
                this.drawPoly(this.getComponent(cc.Mask), this.getComponent(cc.PolygonCollider).points);
                break;
		}
	}

    private drawPoly(nodeMask: cc.Mask, rawPoints: cc.Vec2[]) {
		var stencil = this.getStencil(nodeMask);
        stencil.clear();
        this.clearVisualPoly();

        var stack = [rawPoints];
        do{
            var stepPoints = stack.splice(0, 1)[0];
            var posIndexArr = this.splitPoly(stepPoints);
            var fixPoints = this.parsePoints(stepPoints, posIndexArr);
            stencil.drawPoly(fixPoints, cc.Color.WHITE, 0, cc.Color.WHITE);
            this.drawVisualPoly(fixPoints);
            
            posIndexArr.forEach(element => {
                if (typeof element == 'object') {
                    var subPoints = [];
                    for (var posIndex = element[2]; posIndex != element[0];) {
                        subPoints.push(stepPoints[posIndex]);
                        posIndex = (posIndex + 1) % stepPoints.length;
                    }
                    subPoints.push(stepPoints[element[0]]);
                    subPoints.push(element[1]);
                    stack.push(subPoints);
                }
            });
        }while(stack.length > 0);
    }

    private splitPoly(points: cc.Vec2[]) {
        var contains = [];
        for (var i = 0; i < points.length; i++) {
            var currIndex = i;
            var prevIndex = (i - 1 + points.length) % points.length;
            var nextIndex = (i + 1) % points.length;
            var side1 = cc.pSub(points[currIndex], points[prevIndex]);
            var side2 = cc.pSub(points[nextIndex], points[currIndex]);
            var area = side1.x * side2.y - side1.y * side2.x;
            if (area < 0) {
                // 返回线段起点索引
                var border = this.findClosestIntersectBorder(points, currIndex);
                contains.push(border);

                if (border[0] < i) {
                    contains = contains.filter(ele => {
                        return typeof ele == 'number'? ele > border[0]: true;
                    })
                    break;
                }
                i = border[0];
            } else {
                contains.push(currIndex);
            }
        }

        return contains;
    }

    private findClosestIntersectBorder(points, pointIndex) {
        var target = {min: null, border: []};
        for (var i = 0; i < points.length; i++) {
            var currIndex = i;
            var prevIndex = (i - 1 + points.length) % points.length;
            if (currIndex != pointIndex && prevIndex != pointIndex) {
                var a = points[pointIndex - 1];
                var b = points[pointIndex];
                var c = points[prevIndex];
                var d = points[currIndex];
                var retP = cc.p(0, 0);
                if (cc.pLineIntersect(a, b, c, d, retP) && (retP.y >= 0.0 && retP.y <= 1.0 && retP.x > 0)) {
                    if (target.min == null || target.min > retP.x) {
                        target.min = retP.x;
                        var P = cc.p(0, 0);
                        P.x = a.x + retP.x * (b.x - a.x);
                        P.y = a.y + retP.x * (b.y - a.y);
                        target.border = [prevIndex, P, pointIndex];
                    }
                }
            }
        }
        return target.border;
    }

    private clearVisualPoly() {
        var graphics = this.nodeGraphics;
        if (!graphics) {
            return;
        }

        graphics.clear();
    }

    private drawVisualPoly(points: cc.Vec2[]) {
        var graphics = this.nodeGraphics;
        if (!graphics) {
            return;
        }

        var isBegin = true;
        points.forEach(element => {
            isBegin? graphics.moveTo(element.x, element.y) : graphics.lineTo(element.x, element.y);
            isBegin = false;
        });
        graphics.stroke();
    }

    private parsePoints(points, arr) {
        var ret = [];
        arr.forEach(element => {
            if (typeof element == 'number') {
                ret.push(points[element]);
            } else {
                ret.push(element[1]);
            }
        });
        return ret;
    }

    private getStencil(nodeMask: cc.Mask) {
		return nodeMask._clippingStencil;
    }
}
