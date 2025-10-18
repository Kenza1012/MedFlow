import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ============================
  // 🔍 Vérifier email + mot de passe
  // ============================
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    return user;
  }

  // ============================
  // 🔐 Génération du token JWT
  // ============================
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    // ✅ On ajoute l'ID dans le payload (sous la clé userId)
    const payload = {
      sub: user.id,         // identifiant standard JWT
      userId: user.id,      // identifiant pour ton app
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
