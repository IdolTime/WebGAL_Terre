import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ManageGameModule } from './Modules/manage-game/manage-game.module';
import { LspModule } from './Modules/lsp/lsp.module';
import { AuthController } from './Modules/auth/auth.controller';
import { AuthService } from './Modules/auth/auth.service';

@Module({
  imports: [
    // 代码提示
    LspModule,
    ManageGameModule,
    // 静态文件服务：游戏与编辑器静态资源文件
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    // 静态文件服务：引擎模板
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets', 'templates', 'IdolTime_Template'),
      serveRoot: '/games/:gamename/',
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule { }
