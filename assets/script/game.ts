// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    targetNode: cc.Node = null
    @property(cc.Node)
    knifeNode: cc.Node = null
    @property(cc.Prefab)
    knifePrefab: cc.Prefab = null

    //是否点击屏幕
    canThrow: boolean = true
    //木桩转速
    targetRotation: number = 3
    //小刀数组
    knifeNodeArr = []

    //判断已经插入的小刀是否碰撞了
    isHit: boolean = false
    //夹角用于判断小刀碰撞
    gap: number = 15
  

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.targetNode.zIndex = 1

        this.node.on("touchstart",this.throwKnife,this)

        setInterval(()=>{
            this.changeSpeed()
        },2000)
    }
    

    onDestroy (){
        this.node.off("touchstart",this.throwKnife,this)
    }


    changeSpeed(){
        let dir = Math.random() >0.5 ? 1 : -1
        let speed = 1 + Math.random() * 4
        this.targetRotation = dir * speed
    }

    throwKnife() {
        if (this.canThrow) {
            this.canThrow = false

            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.13,cc.v2(this.knifeNode.x ,this.targetNode.y-this.targetNode.width/2))
                cc.callFunc(()=>{

                    for(let knifeNode of this.knifeNodeArr){
                        if (Math.abs(knifeNode.angle)  < this.gap || Math.abs(360 - knifeNode.angle) < this.gap)
                        this.isHit = true
                        break
                    }
                    if (this.isHit){
                        //碰撞旋转弹出屏幕
                        this.knifeNode.runAction(
                            cc.sequence(
                                cc.spawn(
                                    cc.moveTo(0.25,cc.v2(this.knifeNode.x,-cc.winSize.height)),
                                    cc.rotateTo(0.25,30)
                                )
                                cc.callFunc( () => {
                                    cc.director.loadScene('game')
                                })
                            )
                           
                        )
                    }else{
                        let knifeNode = cc.instantiate(this.knifePrefab)
                        knifeNode.setPosition(this.knifeNode.position)
                        this.node.addChild(knifeNode)
                        this.knifeNode.setPosition(cc.v2(0,-300))
                        this.knifeNodeArr.push(knifeNode)
                        this.canThrow = true
                    }

                    
                })
            ))
        }
    }


  
    update (dt) {
        //木桩旋转
        this.targetNode.angle = (this.targetNode.angle + this.targetRotation) % 360

        //戳中的每一个小刀旋转一个弧度
        for(let knifeNode of this.knifeNodeArr){
            knifeNode.angle = (knifeNode.angle + this.targetRotation) % 360
            //计算弧度
            let rad = Math.PI * (knifeNode.angle -90)/180

            let r = this.targetNode.width/2
            knifeNode.x = this.targetNode.x + r * Math.cos(rad)
            knifeNode.y = this.targetNode.y + r * Math.sin(rad)
        }
    }
}
